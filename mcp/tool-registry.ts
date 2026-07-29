import { BrowserSession } from "./browser-session";
import { JsonObject, ToolContext, ToolDefinition, ToolResult, } from "./types";

// Central registry for all executable MCP tools.
export class ToolRegistry {

    // Registered tools indexed by unique name.
    private readonly tools = new Map< string, ToolDefinition<any> > ();

    // Register one or more tools.
    register(
        ...definitions: readonly ToolDefinition<any>[]
    ): void {

        for (const tool of definitions) {
            if (this.tools.has(tool.name)) {
                throw new Error(`Tool '${tool.name}' has already been registered.`,);    
            }
            this.tools.set(tool.name, tool);
        }

    }

    // Register multiple tools.
    registerMany(
        definitions: readonly ToolDefinition<any>[],
    ): void {

        this.register(...definitions);

    }

    // Check whether a tool exists.
    has(name: string): boolean {
        return this.tools.has(name);
    }

    // Get tool definition
    get(name: string): ToolDefinition<any> {

        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Unknown tool '${name}'.`,);    
        }
        return tool;

    }

    // Get all registered tools.
    getAll(): readonly ToolDefinition<any>[] {
        return [...this.tools.values()];
    }

    // Execute a tool with runtime validation.
    async execute(
        name: string,
        args: JsonObject,
    ): Promise<ToolResult> {

        const tool = this.get(name);
        // Runtime validation using Zod.
        const validatedArgs = tool.schema.parse(args);
        const context: ToolContext<typeof validatedArgs> = {
            session: BrowserSession.getSession(),
            args: validatedArgs,
        };
        return tool.execute(context);

    }

    // Number of registered tools.
    size(): number {
        return this.tools.size;
    }

    // Remove all registered tools. Intended for testing only.
    clear(): void {
        this.tools.clear();
    }

}