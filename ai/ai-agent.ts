import { Planner } from "./planner";
import { Executor } from "./executor";
import { BrowserSession } from "../mcp/browser-session";
import {ExecutionReport, ExecutionStep,} from "./executor";
import { PromptContext } from "./prompt/promptbuilder";
import { ToolRegistry } from "../mcp/tool-registry";
import { LLMClient, LLMClientConfig } from "./llm-client";
import { performance } from "node:perf_hooks";
import { RuntimeConfig } from "./runtime-config";


/* Configuration required by AIAgent. */
export interface AIAgentConfig {
    // LLM Client configuration.
    llm: LLMClientConfig;
    // Shared Tool Registry instance. Must be pre-populated with all required tools.
    toolRegistry: ToolRegistry;
    hooks?: AgentHooks;
}

/* Agent lifecycle state. */
export enum AgentState {
    Idle = "idle",
    Ready = "ready",
    Running = "running",
    ShuttingDown = "shutting_down",
    Shutdown = "shutdown",
}

/* Execution metrics. */
export interface ExecutionMetrics {
    startedAt: Date;
    finishedAt: Date;
    durationMs: number;
    success: boolean;
}

/* Optional lifecycle hooks.*/
export interface AgentHooks {
    onPlanningStarted ? (context: PromptContext, ): Promise<void> | void;
    onPlanningCompleted ? (steps: readonly ExecutionStep[], ): Promise<void> | void;
    onExecutionStarted ? (steps: readonly ExecutionStep[], ): Promise<void> | void;
    onExecutionCompleted ? (report: ExecutionReport, metrics: ExecutionMetrics, ): Promise<void> | void;
    onError ? (error: Error, ): Promise<void> | void;
}

// --------------------------------------------------------------------------------------------------------------------------------------

/*
 * Main orchestration layer.
 *
 * Responsibilities
 * ----------------
 * - Own Planner
 * - Own Executor
 * - Own LLM Client
 * - Manage lifecycle
 * - Coordinate planning & execution
 *
 * Does NOT
 * --------
 * - Execute Playwright directly
 * - Generate prompts
 * - Implement tools
 */
export class AIAgent {

    private readonly llmClient: LLMClient;
    private readonly planner: Planner;
    private readonly executor: Executor;
    private state: AgentState = AgentState.Idle;
    private abortController = new AbortController();
    private isShuttingDown = false;

    constructor ( private readonly config: AIAgentConfig, ) {
        this.llmClient = new LLMClient(config.llm, );
        this.planner = new Planner(this.llmClient, );            
        this.executor = new Executor(config.toolRegistry, );
    }

    /*
     * Initialize AI Agent.
     *
     * Future extension:
     * - Validate LLM connectivity
     * - Warm-up model
     * - Load cache
     */
    async initialize(): Promise<void> {
        if (this.state !== AgentState.Idle) {
            return;
        }
        if (!this.config.toolRegistry) {
            throw new Error("ToolRegistry has not been configured.", );
        }
        // Do not auto-launch browser here. Browser will be launched per-run
        // using the `context.browser` preference so the requested engine is honored.
        this.state = AgentState.Ready;
    }

    /*
     * Shutdown Agent.
     *
     * Future extension:
     * - Close browser
     * - Flush logs
     * - Dispose cache
     */
    async shutdown(): Promise<void> {
        await BrowserSession.close();
        this.state = AgentState.Shutdown;
    }

    /* Returns current agent state. */
    getState(): AgentState {
        return this.state;
    }

    /*
     * Indicates whether the agent
     * is ready to execute requests.
     */
    isReady(): boolean {
        return (this.state === AgentState.Ready);
    }

    public getPlanner(): Planner {
        return this.planner;
    }

    public getExecutor(): Executor {
        return this.executor;
    }

// ------------------------------------------------------------------------------------------------------------------------------------------------------------

    /*
     * Build an execution plan without executing it.
     *
     * Useful for:
     * - Plan review
     * - Debugging
     * - Dry run
     */
    public async createPlan(context: PromptContext, ): Promise<ExecutionStep[]> {
        this.ensureReady();
        return await this.planner.buildPlan(context, );
    }

    /*
     * Execute an existing execution plan.
     */
    public async executePlan(steps: ExecutionStep[], ): Promise<ExecutionReport> {
        this.ensureReady();
        this.state = AgentState.Running;
        try {
            return await this.executor.execute(steps, );
        } finally {
            this.state = AgentState.Ready;
        }
    }

    /**
     * Convenience method.
     *
     * Planning + Execution.
     */
    public async run(context: PromptContext, ): Promise<ExecutionReport> {

        this.ensureReady();
        // Ensure browser engine matches requested context.browser
        try {
            const requested = mapBrowserName(context.browser);
            const current = BrowserSession.getBrowserName();
            if (!BrowserSession.isRunning() || current !== requested) {
                if (BrowserSession.isRunning()) {
                    await BrowserSession.close();
                }
                await BrowserSession.launch({ 
                    browserName: requested,
                    headless: RuntimeConfig.headless, 
                });
            }
        } catch (err) {
            // non-fatal; continue and let tools fail if browser unavailable
            console.log("[AIAgent] Failed to ensure browser engine:", err);
        }
        const startedAt = new Date();
        const started = performance.now();

        try {

            await this.invokeHook( () =>
                    this.config.hooks?.onPlanningStarted?.(context, ),
            );
            this.log("Building execution plan...", );
            const plan = await this.createPlan(context, );
            await this.invokeHook( () =>
                    this.config.hooks?.onPlanningCompleted?.(plan, ),
            );
            await this.invokeHook( () =>
                    this.config.hooks?.onExecutionStarted?.(plan, ),
            );
            this.log(`Executing ${plan.length} steps...`, );
            const report = await this.executePlan(plan, );
            const finishedAt = new Date();
            const metrics: ExecutionMetrics = {
                startedAt,
                finishedAt,
                durationMs:
                    performance.now() -
                    started,
                success:
                    report.success,
            };
            await this.invokeHook(
                () =>
                    this.config.hooks?.onExecutionCompleted?.(report, metrics, ),
            );
            this.log(`Execution finished (${metrics.durationMs.toFixed(0)} ms).`, );
            return report;

        } catch (error) {

            const err = error instanceof Error ? error : new Error(String(error),);                    
            await this.invokeHook( () =>
                    this.config.hooks?.onError?.(err, ),
            );
            this.log(err.message, );
            throw err;

        }

    }

    /*
     * Execute multiple PromptContext sequentially.
     *
     * Every PromptContext is planned independently.
     */
    public async runSuite(contexts: readonly PromptContext[], ): Promise<ExecutionReport[]> {
        this.ensureReady();
        const reports: ExecutionReport[] = [];
        for (const context of contexts) {
            const report = await this.run(context,);      
            reports.push(report,); 
        }
        return reports;
    }

    /*
     * Ensure agent is ready before execution.
     */
    private ensureReady(): void {
        if (this.state === AgentState.Shutdown) {  
            throw new Error("AI Agent has already been shutdown.", );   
        }
        if (this.state === AgentState.ShuttingDown) {
            throw new Error("AI Agent is shutting down.");
        }        
        if (this.state === AgentState.Idle) {      
            throw new Error("AI Agent has not been initialized.", ); 
        }
        if (this.state === AgentState.Running) {
            throw new Error("AI Agent is already executing a task.", ); 
        }
    }    

// ---------------------------------------------------------------------------------------------------------------------------------------    

/*
 * Executes a hook safely.
 */
private async invokeHook(hook: (() => Promise<void> | void) | undefined, ): Promise<void> {
    if (!hook) {
        return;
    }
    await hook();
}

/*
 * Simple logger.
 *
 * Can be replaced later by Winston / Pino.
 */
private log(message: string, ): void {
    console.log(`[AIAgent] ${message}`, );   
}


}

/*
 * Map human-friendly browser names to Playwright engine identifiers.
 */
function mapBrowserName(name?: string | undefined | null): string {
    if (!name) return 'chromium';
    const n = name.toString().toLowerCase();
    if (n.includes('fire')) return 'firefox';
    if (n.includes('webkit') || n.includes('safari')) return 'webkit';
    // treat chrome / chrome-like as chromium
    return 'chromium';
}