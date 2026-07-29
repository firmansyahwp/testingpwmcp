import {test} from '@playwright/test';
import {LoginPage} from '../../web/pages/LoginPage';
import {MyInfoPage} from '../../web/pages/MyInfoPage';
import {ReportManager} from '../../utils/ReportManager';
import {ConfigReader} from '../../utils/ConfigReader';
import {ExcelReader} from '../../utils/ExcelReader';


test('Login Test', async({page})=> {

const loginPage = new LoginPage(page);
const myinfoPage = new MyInfoPage(page);

//path test data excel
const filePath = ConfigReader.get('testdataWEB')+'/TestWEB.xlsx';

/*Config Scenario Testing */
const configData = ExcelReader.readSheet(
        filePath,
        'Config'
    );


for (let i = 0; i < configData.length; i++) {
        const config = configData[i];

        if (
            ConfigReader.checkPassedFile(
            ConfigReader.get('passed_path'),config.TC_ID+"_"+config.TC_Name)
           ) {
                console.log(`${config.TC_ID}_${config.TC_Name} has been passed`);
                continue;
             }

        // ambil data config
        const tcId = config.TC_ID;
        const submenuSheet = config.SUBMENU;
        const menu = config.MENU;
        console.log(`Running ${tcId}`);
        // buka sheet submenu
        const submenuData =
            ExcelReader.readSheet(
                filePath,
                submenuSheet
            );
        // cari data sesuai TC_ID
        const testData = submenuData.find(
            (row: any) => row.TC_ID === tcId
        );
        if (!testData) {
            console.log(`Data ${tcId} tidak ditemukan`);
            continue;
        }

        // ------------------------------------------------ Execute Test ---------------------------------------------------------
        ReportManager.initReport(
                config.TC_ID,
                config.TC_Name
            );

        ReportManager.startTest(
                'TC001',
                'Verify Login Success'
            );

        await loginPage.openApplication(ConfigReader.get('url'));

        await loginPage.login(ConfigReader.get('usernameApp'), ConfigReader.get('passwordApp'))
            
        await loginPage.verifyLoginSuccess();

        ReportManager.startTest(
                'TC002',
                'Choose Dashboard Menu and Sub Menu'
            );

        await loginPage.menuDashboard(config.MENU)
        
        /*

        ReportManager.startTest(
                'TC003',
                `${config.SUBMENU}`
            );

        if (config.SUBMENU != "Personal Details") {
            await myinfoPage.submenuMyInfo(config.SUBMENU)
        }


        await myinfoPage.requiredFieldsMyInfo(
            testData.FirstName,
            testData.MiddleName,
            testData.LastName,
            testData.EmployeeID,
            testData.OtherID,
            testData.DriverLicensed,
            testData.LicensedExp,
            testData.Nationality,
            testData.MaritalStatus,
            testData.Birth,
            testData.Gender
        )    

        */


        ReportManager.startTest(
                'TC004',
                'Verify Logout Success'
            );

        await loginPage.logout()
        
        // ------------------------------------------------ Reporting ------------------------------------------------------------

        await ReportManager.endTesting();

        //update Passed File
        ConfigReader.createPassedFile(ConfigReader.get('passed_path'), config.TC_ID+"_"+config.TC_Name)

    }

})

function checkPassedFile(arg0: string, TC_ID: any) {
    throw new Error('Function not implemented.');
}

