import { BasePage } from './BasePage';
import{ Page } from '@playwright/test'
import { MyInfoLocator } from '../locators/MyInfoLocator';
import {ReportManager} from '../../utils/ReportManager';

export class MyInfoPage extends BasePage {

    constructor(page: Page) {
        super(page)
    }

    /*
    ============================================================= FUNCTION ===========================================================
    */

    async submenuMyInfo(submenuName:string) {
        await this.waitElement(MyInfoLocator.submenu(submenuName))
        await this.click(MyInfoLocator.submenu(submenuName));
        await this.delay(3000)
        await ReportManager.logStep(
            this.page,
            'Choose Sub Menu',
            `Sub Menu : ${submenuName}`,
            `Sub Menu : ${submenuName}`,
            'PASS'
        );
    }

    async requiredFieldsMyInfo(
        firstName: string,
        middleName: string,
        lastName: string,
        employeeID: string,
        otherID: string,
        driverLicensed: string,
        licensedExp: string,
        nationality: string,
        maritalStatus: string,
        birth: string,
        gender: string
    ) {
        await this.delay(2000)
        await this.waitElement(MyInfoLocator.firstName)

        await this.clear(MyInfoLocator.firstName)
        await this.type(MyInfoLocator.firstName, firstName)
        await this.clear(MyInfoLocator.middleName)
        await this.type(MyInfoLocator.middleName, middleName)
        await this.clear(MyInfoLocator.lastName)
        await this.type(MyInfoLocator.lastName, lastName)
        
        //
        await this.clear(MyInfoLocator.employeeID)
        await this.type(MyInfoLocator.employeeID, employeeID)
        await this.clear(MyInfoLocator.otherID)
        await this.type(MyInfoLocator.otherID, otherID)
        await this.clear(MyInfoLocator.driverLicensed)
        await this.type(MyInfoLocator.driverLicensed,driverLicensed)
        await this.clear(MyInfoLocator.licensedExp)
        await this.type(MyInfoLocator.licensedExp, licensedExp)
        
        //
        //await this.click(MyInfoLocator.dropdown_nationality)
        //await this.click(MyInfoLocator.list_nationality(nationality))
        //await this.click(MyInfoLocator.dropdown_martialStatus)
        //await this.click(MyInfoLocator.list_maritalStatus(maritalStatus))
        //
        
        await this.clear(MyInfoLocator.birth)
        await this.type(MyInfoLocator.birth, birth)
        await this.click(MyInfoLocator.gender(gender))

        await ReportManager.logStep(
            this.page,
            'Personal Details',
            'Requirement Fields',
            'Requirement Fields',
            'PASS'
        );

        await this.waitElement(MyInfoLocator.btnSave_Required)
        await this.click(MyInfoLocator.btnSave_Required)
        await this.delay(5000)

        await ReportManager.logStep(
            this.page,
            'Save Requirement Fields',
            'Saved',
            'Saved',
            'PASS'
        );

    }


}