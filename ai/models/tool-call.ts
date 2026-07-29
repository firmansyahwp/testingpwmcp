// Represents a single MCP Tool invocation.

export interface ToolCall {

  // MCP Tool name. Must match a registered tool inside ToolRegistry.
  tool: string;

  // Tool parameters required by the tool.
  arguments: Record<string, unknown>;

  // Tool execution timeout in milliseconds. If not specified, the default timeout for the tool will be used.
  timeout?: number;

  // Retry count if execution fails. Default is 0
  retry?: number;
}