import { test } from "@playwright/test";
import { createAgent } from "../../ai/create-agent";
import { RuntimeConfig } from "../../ai/runtime-config";
import { ReportManager } from "../../utils/ReportManager";
import { ConfigReader } from '../../utils/ConfigReader';
import { ExcelReader } from '../../utils/ExcelReader';


test.setTimeout(60000);

/* Path Test Data Excel */
const filePath = ConfigReader.get('testdataAI') + '/AITest.xlsx';
/* Config Scenario Testing */
const configData = ExcelReader.readSheet(filePath, 'SCN_TEST1');

/* Loop through each row of the configData and create a test for each row */
for (const row of configData) {
    const testdata = row;
    const passedKey = `${testdata.TC_ID}_${testdata.TC_Name}`;

    test(`AI ${passedKey}`, async ({}, testInfo) => {

         /* Set the headless mode based on the project configuration */
         RuntimeConfig.headless = testInfo.project.use.headless;

         /* Check if the test case has already passed */
         if (ConfigReader.checkPassedFile(ConfigReader.get('passed_path'), passedKey)) {
             console.log(`${passedKey} has been passed`);
             return;
         }

         console.log(`Running -> ${testdata.TC_ID}`);

         /* Create an agent for the test case */
         let agent;
         try {
                agent = await createAgent();
         } catch (error) {
             console.error(`Failed to create agent for ${testdata.TC_ID}:`, error);
             throw error;
         }

         ReportManager.initReport(testdata.Summary, 'Automation AI Testing');
         ReportManager.startTest(testdata.TC_ID, testdata.TC_Name);

         try {

             /* Run the agent with a timeout of 60 seconds */
             const report = await Promise.race([
                 agent.run({
                     objective: 
                         testdata.Objective,
                     summary: 
                         testdata.Summary,
                     generatedBy: 
                         'AI',
                     application: 
                         'Test Automation',
                     baseUrl: 
                         testdata.url,
                     environment: 
                         testdata.Environment,
                     browser: 
                         'chromium',
                     testCaseDefaults: 
                         {
                             idPrefix: testdata.TC_ID,
                             tags: testdata.Tags,
                             name: testdata.TC_Name,
                         },
                     userPrompt: 
                         testdata.Step,
                 }),
                 new Promise<never>((_, reject) => {
                     setTimeout(() => reject(new Error(`Timed out after 60000ms for ${testdata.TC_ID}`)), 60000);
                 }),
                ]);
                
                if (report.success) {
                    /* Mark the test case as passed in the passed file */
                    ReportManager.endTesting();
                    ConfigReader.createPassedFile(ConfigReader.get('passed_path'), passedKey);
                } else {
                    throw new Error(`Test case reported failure for ${testdata.TC_ID}`);
                }

            } catch (error) {

                /* Log the error and rethrow it to fail the test case */
                console.error(`Test case failed for ${testdata.TC_ID}:`, error);
                //throw error;
                throw error

            } finally {

                /* Ensure the agent is properly shut down after the test case */
                if (agent?.shutdown) {
                    await agent.shutdown();
                }

            }
        }
    );
}