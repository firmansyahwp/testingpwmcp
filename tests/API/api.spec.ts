import { test }
from '@playwright/test';

import { APITest }
from '../../api/APITest';

import { ExcelReader }
from '../../utils/ExcelReader';

import {ReportManager} 
from '../../utils/ReportManager';

import {ConfigReader} 
from '../../utils/ConfigReader';


test(

'Enterprise API Testing',

async ({ request }) => {

    //path test data excel
    const filePath = ConfigReader.get('testdataAPI')+'/TestAPI.xlsx';
    const sheetName = 'API_TEST';

    const apiTest = new APITest(request);    

    // =====================================
    // READ EXCEL
    // =====================================

    const testData = ExcelReader.readSheet(filePath, sheetName);

    ReportManager.initReport(
                "Testing Report API",
                "API TESTING"
            );

    // =====================================
    // LOOP ALL DATA
    // =====================================

    for (let i=0; i<testData.length; i++) {

        const row =
            testData[i];

        const excelRow =
            i + 2;

        // =================================
        // SKIP RUN IF EXISTING FILE PASSED
        // =================================

        console.log(`EXECUTE ROW ${excelRow}`);
        if (
            ConfigReader.checkPassedFile(
            ConfigReader.get('passed_path'),row.TESTCASE+"_"+row.DESCRIPTION)
           ) {
                console.log(`${row.TESTCASE}_${row.DESCRIPTION} has been passed`);
                continue;
             }

        try {

            // =============================
            // EXECUTE API
            // =============================

            ReportManager.startTest(
                row.TESTCASE,
                row.DESCRIPTION
            );

            const response =
                await apiTest.executeFromExcel(
                    row
                );

            // =============================
            // VALIDATE STATUS
            // =============================

            if (
                row.EXPECTED_STATUS
            ) {
                await apiTest.validateStatus(
                    response,
                    Number(
                        row.EXPECTED_STATUS
                    )
                );
            }

            // =============================
            // VALIDATE TEXT
            // =============================

            if (
                row.EXPECTED_TEXT
            ) {
                await apiTest.validateText(
                    response,
                    row.EXPECTED_TEXT
                );
            }

            // =============================
            // GET RESPONSE
            // =============================

            const responseBody =
                await apiTest.getResponseBody(
                    response
                );
            console.log(
                responseBody
            );

            // =============================
            // WRITE ACTUAL STATUS
            // =============================

            ExcelReader.writeCell(
                filePath,
                sheetName,
                `Q${excelRow}`,
                response.status()
            );

            // =============================
            // WRITE RESULT STATUS
            // =============================

            ExcelReader.writeCell(
                filePath,
                sheetName,
                `R${excelRow}`,
                'PASS'
            );

            await ReportManager.logStepText(
            'Method: '+row.METHOD ,
            'status -> '+row.ACTUAL_STATUS,
            'status -> '+row.EXPECTED_STATUS,
            'PASS',
            row.URL
        );

        //update Passed File
        ConfigReader.createPassedFile(ConfigReader.get('passed_path'), row.TESTCASE+"_"+row.DESCRIPTION)

        } catch (error: any) {

            console.log(error);

            // =============================
            // WRITE RESULT FAIL
            // =============================

            ExcelReader.writeCell(
                filePath,
                sheetName,
                `S${excelRow}`,
                'FAIL'
            );

            // =============================
            // WRITE ERROR MESSAGE
            // =============================

            ExcelReader.writeCell(
                filePath,
                sheetName,
                `T${excelRow}`,
                error.message
            );

            await ReportManager.logStepText(
            'Method: '+row.METHOD,
            'status -> '+row.ACTUAL_STATUS,
            error.message,
            'FAIL',
            row.URL
        );
        }
    }

    await ReportManager.endTesting();
    
    
    
});