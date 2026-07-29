import { ExecutionStep } from "./execution-step";

// Represents a single AI-generated test case.

export interface TestCase {

  // Unique test case identifier. Example: TC001
  id: string;

  // Test case title. Example: "Verify Login Functionality"
  name: string;

  // Optional description for documentation or reporting.
  description?: string;

  // Optional business module. Example: "Authentication"
  module?: string;

  // Tags used for filtering/reporting. Example: ["Smoke","Regression"]
  tags: string[];

  // Expected result of the test case. Example: "User should be able to login successfully."
  expectedResult?: string;

  // Ordered execution steps. Each step is an atomic action that can be executed by the Executor.
  steps: ExecutionStep[];

}