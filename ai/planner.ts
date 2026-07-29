import { PromptBuilder, PromptContext } from "./prompt/promptbuilder";
import { LLMClient } from "./llm-client";
import {
    ExecutionStep,
    ExecutionStepType,
} from "./executor";

/**
 * Raw planner response returned by the LLM.
 */
interface PlannerResponse {
    testCases: PlannerTestCase[];
    objective?: string;
    summary?: string;
    generatedAt?: string;
    generatedBy?: string;
}

interface PlannerTestCase {
    id?: string;
    name?: string;
    description?: string;
    module?: string;
    tags?: string[];
    expectedResult?: string;
    steps: PlannerStep[];
}

interface PlannerStep {
    id: string;
    name?: string;
    tool: string;
    arguments: Record<string, unknown>;
    description?: string;
}

// --------------------------------------------------------------------------------------------------------------------------------------

/**
 * Planner
 *
 * Responsibilities:
 * - Build prompt
 * - Ask LLM
 * - Parse planner response
 * - Convert planner response into ExecutionStep[]
 * - Validate execution steps
 */
export class Planner {

    constructor(
        private readonly llmClient: LLMClient,
        private readonly promptBuilder = new PromptBuilder(),
    ) {}

    /**
     * Build executable plan.
     */
    public async buildPlan(context: PromptContext, ): Promise<ExecutionStep[]> {

        const prompt = this.promptBuilder.build(context);
        console.log("[Planner] Generating execution plan...",);  
        const rawResponse = await this.llmClient.generate(prompt);
        const sanitized = this.sanitizeResponse(rawResponse);
        const plannerResponse = this.parsePlannerResponse(sanitized,);  
        // Override or inject standard metadata from runtime context
        try {
            plannerResponse.objective = context.objective ?? plannerResponse.objective ?? "";
            plannerResponse.summary = (context as any).summary ?? plannerResponse.summary ?? "";
            plannerResponse.generatedAt = new Date().toLocaleString();
            plannerResponse.generatedBy = (context as any).generatedBy ?? plannerResponse.generatedBy ?? "AI";

            if (context.testCaseDefaults && Array.isArray(plannerResponse.testCases)) {
                plannerResponse.testCases = plannerResponse.testCases.map((testCase, index) => {
                    const defaults = context.testCaseDefaults as {
                        idPrefix?: string;
                        tags?: string[];
                        name?: string;
                    };

                    const generatedId = defaults.idPrefix
                        ? `${defaults.idPrefix}${String(index + 1).padStart(3, '0')}`
                        : testCase.id;

                    return {
                        ...testCase,
                        id: testCase.id ?? generatedId,
                        name: testCase.name ?? defaults.name,
                        tags: testCase.tags ?? defaults.tags,
                    };
                });
            }
        } catch (err) {
            // non-fatal: continue with original plannerResponse
        }
        // Log the final planner response after overrides so terminal shows customized values
        try {
            console.log("========== FINAL PLANNER RESPONSE ==========");
            console.log(JSON.stringify(plannerResponse, null, 2));
            console.log("============================================");
        } catch (err) {
            // ignore logging errors
        }
        const executionSteps = this.mapExecutionSteps(plannerResponse,); 
        this.validateSteps(executionSteps, );
        console.log(`[Planner] ${executionSteps.length} execution steps generated.`,);  
        return executionSteps;

    }

    /**
     * Remove markdown wrapper.
     */
    private sanitizeResponse(response: string, ): string {

        return response
            .trim()
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();

    }

    /**
     * Parse planner JSON.
     */
    private parsePlannerResponse(json: string, ): PlannerResponse {

        try {

            return JSON.parse(
                json,
            ) as PlannerResponse;

        } catch (error) {

            throw new Error(

                [
                    "Failed to parse planner response.",
                    "",
                    error instanceof Error
                        ? error.message
                        : "Unknown JSON error",
                    "",
                    json.substring(
                        0,
                        1000,
                    ),

                ].join("\n"),

            );

        }

    }

    /**
     * Convert planner response into executor steps.
     */
    private mapExecutionSteps(response: PlannerResponse, ): ExecutionStep[] {

        if (!response.testCases || response.testCases.length === 0) {       
            throw new Error("Planner response does not contain any test cases.",);      
        }
        const steps: ExecutionStep[] = [];
        for (const testCase of response.testCases) {
            if (!Array.isArray(testCase.steps, ) ) {
                continue;
            }
            for (const step of testCase.steps) {

                steps.push({
                    id:
                        step.id,
                    name:
                        (step as any).name,
                    action:
                        step.tool as ExecutionStepType,
                    args:
                        step.arguments,
                    description:
                        step.description,
                });
            }
        }
        return steps;
    }

    /**
     * Validate planner output.
     */
    private validateSteps(steps: ExecutionStep[], ): void {

        if (!Array.isArray(steps, )) {       
            throw new Error("Execution steps must be an array.",);  
        }
        if (steps.length === 0 ) {    
            throw new Error("Execution plan is empty.",);   
        }
        const validActions = new Set<ExecutionStepType>([

                "launch_browser",
                "close_browser",

                "goto",
                "refresh",
                "back",

                "click",
                "double_click",
                "hover",
                "type",
                "press_key",
                "select_option",
                "check",
                "uncheck",

                "wait",
                "wait_visible",
                "wait_hidden",
                "wait_load",

                "verify_visible",
                "verify_hidden",
                "verify_enabled",
                "verify_disabled",
                "verify_checked",
                "verify_text",
                "verify_value",
                "verify_url",
                "verify_title",
                "verify_count",
                "verify_attribute",

                "scroll",
                "upload",
                "drag_drop",

            ]);

        for (const step of steps) {

            if (!step.id) {
                throw new Error("Execution step missing id.",);          
            }
            if (!step.action) {
                throw new Error(`Execution step '${step.id}' missing action.`,);           
            }
            if (!validActions.has(step.action, )) {        
                throw new Error(`Planner generated unsupported tool '${step.action}'.`,);     
            }
            if (step.args === undefined || step.args === null) {
                throw new Error(`Execution step '${step.id}' missing args.`,);      
            }

        }

    }

}