import os from 'os';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import screenshot from 'screenshot-desktop';
import { Page } from '@playwright/test';
import {ConfigReader} from '../utils/ConfigReader';

export class ReportManager {

    // =========================================
    // GLOBAL STATE
    // =========================================

    static baseFolder: string;
    static screenshotFolder: string;
    static jsonFile: string;
    static pdfFile: string;
    static reportName: string;
    static timestamp: string;

    static project: any = {};
    static testResults: any[] = [];

    static currentTest: any = null;
    static currentSteps: any[] = [];

    static totalTest = 0;
    static totalPass = 0;
    static totalFail = 0;

    // =========================================
    // CAPTURE ROBOT FULL SCREEN
    // =========================================

    static async takeFullScreenshot(page:Page, filePath: string): Promise<boolean> {
        try {
            // WAIT PAGE STABLE
            await page.waitForLoadState('domcontentloaded');
            // WAIT UI STABLE
            await page.waitForTimeout(3000);
            // DESKTOP SCREENSHOT
            await screenshot({filename: filePath});
            return true;
        } catch (error: any) {
            console.log('❌ Failed desktop screenshot:', error.message);
            return false;
        }
    }

    // =========================================
    // CAPTURE PlAYWRIGHT SELENIUM
    // =========================================

    static async takeScreenshot(page:Page, filePath: string): Promise<boolean> {
        try {
             // WAIT PAGE STABLE
            await page.waitForLoadState('domcontentloaded');
            // OPTIONAL SMALL DELAY
            //await page.waitForTimeout(3000);
            await page.waitForLoadState("load")
            // PLAYWRIGHT SCREENSHOT
            await page.screenshot({
                path: filePath,
                fullPage: true
            });
            return true;
        } catch (error: any) {
            console.log('❌ Failed playwright screenshot:', error.message);
            return false;
        }
    }

    // =========================================
    // INIT REPORT
    // =========================================

    static initReport(reportName: string, reportTitle: string) {
        const now = new Date();
        this.timestamp = this.formatDate(now, 'yyyyMMdd_HHmmss');
        //for CI/CD will be hardcode to specific directory
        this.baseFolder = this.normalizePath(
            path.join(
                //process.cwd(),
                ConfigReader.get('report_path'), //'Reports',
                this.formatDate(now, 'yyyy-MM-dd')
            )
        );
        this.screenshotFolder = this.normalizePath(
            path.join(this.baseFolder, '_temp')
        );
        fs.mkdirSync(this.screenshotFolder, { recursive: true });
        this.jsonFile = this.normalizePath(
            path.join(
                this.baseFolder,
                `${reportName}_${this.timestamp}.json`
            )
        );
        this.pdfFile = this.normalizePath(
            path.join(
                this.baseFolder,
                `${reportName}_${this.timestamp}.pdf`
            )
        );
        this.project = {
            name: reportName,
            report_title: reportTitle,
            environment: 'TESTING',
            executed_by: 'Playwright',
            execution_time: now.toString(),
            logo: this.normalizePath(
                path.join(process.cwd(), 'reports', 'logo.png')
            )
        };
        this.testResults = [];
        console.log('===================================');
        console.log('✅ INIT REPORT SUCCESS');
        console.log('BASE FOLDER:', this.baseFolder);
    }

    // =========================================
    // START TEST
    // =========================================

    static startTest(tc_id: string, tc_name: string) {
        this.autoCloseCurrentTest();
        this.currentSteps = [];
        this.currentTest = {
            test_case_id: tc_id,
            test_case_name: tc_name,
            status: 'PASS',
            steps: this.currentSteps
        };
    }

    // =========================================
    // LOG STEP WEB IMAGE
    // =========================================

    static async logStep(page: Page, desc: string, expected: string, actual: string, status: string) {
        if (this.currentTest == null) {
            console.log('❌ startTest belum dipanggil');
            return;
        }
        const screenshotPath = this.normalizePath(
            path.join(
                this.screenshotFolder,
                `STEP_${this.currentSteps.length + 1}_${Date.now()}.png`
            )
        );
        //const captured = await this.takeFullScreenshot(page,screenshotPath);
        const captured = await this.takeScreenshot(page,screenshotPath);
        const step = {
            step_no: this.currentSteps.length + 1,
            description: desc,
            expected: expected,
            actual: actual,
            status: status,
            capture: {
                type: 'image',
                value: captured ? screenshotPath : ''
            }
        };
        if (status === 'FAIL') {
            this.currentTest.status = 'FAIL';
        }
        this.currentSteps.push(step);
    }

    // =========================================
    // LOG STEP TEXT
    // =========================================

    static logStepText(
        desc: string,
        expected: string,
        actual: string,
        status: string,
        textCapture: string
    ) {
        const step = {
            step_no: this.currentSteps.length + 1,
            description: desc,
            expected: expected,
            actual: actual,
            status: status,
            capture: {
                type: 'text',
                value: textCapture
            }
        };
        if (status === 'FAIL') {
            this.currentTest.status = 'FAIL';
        }
        this.currentSteps.push(step);
    }

    // =========================================
    // AUTO CLOSE TEST
    // =========================================

    static autoCloseCurrentTest() {
        if (this.currentTest == null) return;
        this.totalTest++;
        if (this.currentTest.status === 'PASS') {
            this.totalPass++;
        } else {
            this.totalFail++;
        }
        this.testResults.push(this.currentTest);
        this.currentTest = null;
    }

    // =========================================
    // END TESTING
    // =========================================

    static async endTesting() {
        this.autoCloseCurrentTest();
        const finalJson = {
            project: this.project,
            summary: {
                total_test: this.totalTest,
                passed: this.totalPass,
                failed: this.totalFail
            },
            test_results: this.testResults
        };
        const prettyJson = JSON.stringify(finalJson, null, 4);
        this.saveJSON(prettyJson);
        this.runPython();
    }

    // =========================================
    // SAVE JSON
    // =========================================

    static saveJSON(content: string) {
        fs.writeFileSync(this.jsonFile, content, 'utf-8');
        console.log('✅ JSON CREATED:', this.jsonFile);
    }

    // =========================================
    // RUN PYTHON / EXE
    // =========================================

    static runPython() {
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        const scriptPath = this.normalizePath(
            path.join(
                process.cwd(),
                'reports',
                //'generatereportV2.exe'
                'generatereportV2.py'
            )
        );
        console.log('==============================');
        console.log('RUN REPORT GENERATOR');
        console.log('SCRIPT:', scriptPath);
        console.log('JSON:', this.jsonFile);
        console.log('PDF:', this.pdfFile);
        try {
            // Execute file .exe
            /* 
            execFileSync(
                scriptPath,
                [this.jsonFile, this.pdfFile],
                {
                    stdio: 'inherit'
                }
            );
            */
           // Execute script .py
           
           execFileSync(
                pythonCmd,
                [
                    scriptPath,
                    this.jsonFile,
                    this.pdfFile
                ],
                {
                    stdio: 'inherit'
                }
            );

            console.log('✅ PDF Generated');
        } catch (error) {
            console.log('❌ Report Generator gagal');
        }
    }

    // =========================================
    // NORMALIZE PATH
    // =========================================

    static normalizePath(filePath: string): string {
        return filePath.replace(/\\/g, '/');
    }

    // =========================================
    // DATE FORMATTER
    // =========================================

    static formatDate(date: Date, format: string): string {
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const HH = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return format
            .replace('yyyy', String(yyyy))
            .replace('MM', MM)
            .replace('dd', dd)
            .replace('HH', HH)
            .replace('mm', mm)
            .replace('ss', ss);
    }

}