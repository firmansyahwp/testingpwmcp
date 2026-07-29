import { AIAgent } from "./ai-agent";
import { ToolRegistry } from "../mcp/tool-registry";
import { tools } from "../mcp/tools";

export async function createAgent(): Promise<AIAgent> {

    const registry = new ToolRegistry();
    registry.registerMany(tools);
    const agent = new AIAgent({
        llm: {
            endpoint: "http://localhost:11434/api/generate",
            model: "gemma4:31b-cloud",
            timeout: 600000,
        },
        toolRegistry: registry,
    });
    await agent.initialize();
    return agent;

}