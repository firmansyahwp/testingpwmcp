import { ToolRegistry } from '../mcp/tool-registry';
import { BrowserSession } from '../mcp/browser-session';
import { ReportManager } from '../utils/ReportManager';

/*
 * Supported execution actions from Planner
 */
export type ExecutionStepType =
    | "launch_browser"
    | "close_browser"

    | "goto"
    | "refresh"
    | "back"

    | "click"
    | "double_click"
    | "hover"
    | "type"
    | "press_key"
    | "select_option"
    | "check"
    | "uncheck"

    | "wait"
    | "wait_visible"
    | "wait_hidden"
    | "wait_load"

    | "verify_visible"
    | "verify_hidden"
    | "verify_enabled"
    | "verify_disabled"
    | "verify_checked"
    | "verify_text"
    | "verify_value"
    | "verify_url"
    | "verify_title"
    | "verify_count"
    | "verify_attribute"

    | "scroll"
    | "upload"
    | "drag_drop";

/*
 * Single execution step from Planner
 */
export interface ExecutionStep {
    id: string;
    name?: string;
    action: ExecutionStepType;
    args: Record<string, unknown>;
    description?: string;
}

/*
 * Result per step execution
 */
export interface ExecutionResult {
  stepId: string;
  action: ExecutionStepType;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: number;
}

/*
 * Final execution report
 */
export interface ExecutionReport {
  success: boolean;
  results: ExecutionResult[];
  failedStepId?: string;
}

/*
 * Executor Engine
 */
export class Executor {
  constructor(
    private readonly toolRegistry: ToolRegistry,
    //private readonly session: BrowserSession,
  ) {}

  /*
   * Execute full plan sequentially
   */
  async execute(steps: ExecutionStep[]): Promise<ExecutionReport> {
    const results: ExecutionResult[] = [];
    for (const step of steps) {
      const result = await this.executeStep(step);
      results.push(result);
      // fail-fast behavior
      if (!result.success) {
        return {
          success: false,
          results,
          failedStepId: step.id,
        };
      }
    }
    return {
      success: true,
      results,
    };
  }

  /*
   * Execute single step
   */
  private async executeStep(step: ExecutionStep): Promise<ExecutionResult> {
    console.log("[Executor] Step:", step.action, step.args);
    const timestamp = Date.now();

    try {

      const { name, args } = this.mapStepToTool(step);
      const response = await this.toolRegistry.execute(name, args);
      // Log step to report (if report initialized)
      try {
        const page = BrowserSession.getPage();
        const stepName = step.name ?? step.id;
        const desc = step.description ?? '';
        const message = response?.message ?? 'ok';
        await ReportManager.logStep(page, stepName, message, message, 'PASS');
      } catch (logErr) {
        // ignore reporting errors
      }
      return {
        stepId: step.id,
        action: step.action,
        success: true,
        message: response?.message ?? 'ok',
        timestamp,
      };

    } catch (err: any) {
      // Log failed step to report
      try {
        const page = BrowserSession.getPage();
        const stepName = step.name ?? step.id;
        const desc = step.description ?? '';
        const message = err?.message ?? String(err);
        await ReportManager.logStep(page, stepName, desc, message, 'FAIL');
      } catch (logErr) {
        // ignore reporting errors
      }
      return {
        stepId: step.id,
        action: step.action,
        success: false,
        error: err?.message ?? String(err),
        timestamp,
      };

    }
  }

  /*
   * Map planner step → MCP tool call
   */
private mapStepToTool(step: ExecutionStep){
    return {
        name: step.action,
        args: step.args
    };
}

}