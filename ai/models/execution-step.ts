/**
 * Represents a single executable step produced by the AI Planner.
 * The Executor will translate this step into an MCP Tool invocation.
 */

export interface ExecutionStep {

  // Unique identifier of the step.
  id: string;

  // Human-readable name. Example: "Open Login Page"
  name: string;

  // Optional description for documentation or reporting.
  description?: string;

  /**
   * MCP Tool name.
   *
   * Must match a registered tool inside ToolRegistry.
   *
   * Example:
   *  - goto
   *  - click
   *  - fill
   *  - waitFor
   *  - verifyText
   *  - screenshot
   */
  tool: string;

  /**
   * Parameters required by the tool.
   *
   * Example:
   * {
   *   url: "...",
   *   locator: "#username",
   *   value: "Admin"
   * }
   */
  arguments: Record<string, unknown>;

  // Whether execution should continue if this step fails. Default is false.
  continueOnFailure?: boolean;
  
  // Timeout (milliseconds) for this step.
  timeout?: number;

  // Retry count if execution fails. Default is 0
  retry?: number;

  // Optional AI notes for debugging or reporting purposes. Not executed.
  notes?: string;
}