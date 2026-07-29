import { PlannerPrompt } from "./plannerprompt";
import { TestCasePrompt } from "./testcaseprompt";

/**
 * Runtime information used to build the final prompt.
 */
export interface PromptContext {
  /**
   * High-level testing objective.
   *
   * Example:
   * Smoke Testing
   * Regression Testing
   * Login Validation
   */
  objective: string;

  /**
   * Application name.
   */
  application?: string;

  /**
   * Base URL of the application.
   */
  baseUrl?: string;

  /**
   * Target environment.
   *
   * Example:
   * DEV
   * SIT
   * UAT
   * PROD
   */
  environment?: string;

  /**
   * Browser used for execution.
   *
   * Example:
   * Chrome
   * Firefox
   * Edge
   */
  browser?: string;

  /**
   * Optional short summary to include in planner output (overrides LLM summary)
   */
  summary?: string;

  /**
   * Optional identifier for who/what generated the plan. Defaults to 'AI'.
   */
  generatedBy?: string;

  /**
   * Optional default metadata for generated test cases.
   */
  testCaseDefaults?: {
    idPrefix?: string;
    tags?: string[];
    name?: string;
    description?: string;
    expectedResult?: string;
  };

  /**
   * Optional business or technical context.
   */
  additionalContext?: string;

  /**
   * Original natural language request.
   */
  userPrompt: string;
}

/**
 * Responsible for assembling the final prompt
 * sent to the LLM.
 *
 * Final Prompt Structure
 *
 * PlannerPrompt
 *        ↓
 * TestCasePrompt
 *        ↓
 * Runtime Context
 *        ↓
 * User Request
 */
export class PromptBuilder {
  /**
   * Build the final prompt.
   */
  public build(context: PromptContext): string {
    return [
      this.buildPlannerSection(),
      this.buildOutputContractSection(),
      this.buildRuntimeContextSection(context),
      this.buildUserRequestSection(context.userPrompt)
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  /**
   * Planner behaviour.
   */
  private buildPlannerSection(): string {
    return PlannerPrompt.trim();
  }

  /**
   * JSON output contract.
   */
  private buildOutputContractSection(): string {
    return TestCasePrompt.trim();
  }

  /**
   * Runtime execution context.
   */
  private buildRuntimeContextSection(
    context: PromptContext
  ): string {
    const lines: string[] = [];

    lines.push("# RUNTIME CONTEXT");

    lines.push(`Objective: ${context.objective}`);

    if (context.application) {
      lines.push(`Application: ${context.application}`);
    }

    if (context.baseUrl) {
      lines.push(`Base URL: ${context.baseUrl}`);
    }

    if (context.environment) {
      lines.push(`Environment: ${context.environment}`);
    }

    if (context.browser) {
      lines.push(`Browser: ${context.browser}`);
    }

    if (context.testCaseDefaults) {
      lines.push("Test Case Defaults:");
      lines.push(JSON.stringify(context.testCaseDefaults));
    }

    if (context.additionalContext) {
      lines.push("");
      lines.push("Additional Context:");
      lines.push(context.additionalContext);
    }

    return lines.join("\n");
  }

  /**
   * Original user request.
   */
  private buildUserRequestSection(
    userPrompt: string
  ): string {
    return [
      "# USER REQUEST",
      userPrompt.trim()
    ].join("\n");
  }
}