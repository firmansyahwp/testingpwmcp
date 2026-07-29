import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolRegistry } from "./tool-registry";
import { JsonObject, ToolResult, ToolStatus, } from "./types";

export class PlaywrightMcpServer {

    private readonly server: Server;

    constructor(private readonly registry: ToolRegistry, ) {
        this.server = new Server(
            {
                name: "playwright-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            },
        );
        this.registerHandlers();
    }

    /**
     * Register all MCP handlers.
     */
    private registerHandlers(): void {
        this.server.setRequestHandler(
            ListToolsRequestSchema,
            this.handleListTools,
        );
        this.server.setRequestHandler(
            CallToolRequestSchema,
            this.handleCallTool,
        );
    }

    /**
     * Handle tools/list.
     *
     * Deliberately typed as any to avoid TS2589
     * caused by MCP SDK recursive generics.
     */
    private handleListTools = async (_request: any) => {

        return {

            tools: this.registry
                .getAll()
                .map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: zodToJsonSchema(
                        tool.schema,
                    ),

                })),

        };

    };

    /**
     * Handle tools/call.
     *
     * Deliberately typed as any to avoid TS2589
     * caused by MCP SDK recursive generics.
     */
    private handleCallTool = async (request: any) => {

        const toolName = request.params.name;

        const args = (
            request.params.arguments ?? {}
        ) as JsonObject;

        try {

            const result =
                await this.registry.execute(
                    toolName,
                    args,
                );

            return this.toMcpResponse(
                result,
            );

        } catch (error) {

            return this.toMcpResponse({

                status: ToolStatus.FAILED,

                message:
                    error instanceof Error
                        ? error.message
                        : String(error),

            });

        }

    };

    /**
     * Convert ToolResult into MCP response.
     */
    private toMcpResponse(result: ToolResult, ) {

        return {

            content: [

                {

                    type: "text",

                    text: JSON.stringify(
                        result,
                        null,
                        2,
                    ),

                },

            ],

            isError:
                result.status ===
                ToolStatus.FAILED,

        };

    }

    /**
     * Start server.
     */
    async start(): Promise<void> {

        const transport = new StdioServerTransport();
        await this.server.connect(transport,); 

    }

}