import { BasePage } from './BasePage';
import{ Page } from '@playwright/test'
import { LoginLocator } from '../locators/LoginLocator';
import {ReportManager} from '../../utils/ReportManager';
import { log } from 'node:console';
import { MyInfoLocator } from '../locators/MyInfoLocator';

export class LoginPage extends BasePage {

    constructor(page: Page) {
        super(page)
    }

    /*
    ============================================================= FUNCTION ===========================================================
    */

    async openApplication(url:string) {
        await this.navigate(url);
        await this.waitElement(LoginLocator.loginButton)
        await ReportManager.logStep(
            this.page,
            'Open Application',
            'Login page displayed',
            'Login page displayed',
            'PASS'
        );
    }

    async login(user:string, pass:string) {
        await this.waitElement(LoginLocator.username)
        await this.type(LoginLocator.username, user)
        await this.type(LoginLocator.password, pass)
        await ReportManager.logStep(
            this.page,
            'Login using valid credential',
            'Credential account',
            'Credential account',
            'PASS'
        );
        await this.click(LoginLocator.loginButton)
    }

    async verifyLoginSuccess() {
        await this.waitLoadingComplete()
        await this.verifyURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index')
        await this.waitElement(LoginLocator.dropdown_profile)
        await ReportManager.logStep(
            this.page,
            'Success Login',
            'Dashboard displayed',
            'Dashboard displayed',
            'PASS'
        );
    }

    async menuDashboard(menu: string) {
        await this.waitElement(LoginLocator.menu(menu))
        await this.click(LoginLocator.menu(menu))
        await this.delay(3000)
        await ReportManager.logStep(
            this.page,
            'Dashboard Menu',
            `Choose dashboard menu ${menu}`,
            `Choose dashboard menu ${menu}`,
            'PASS'
        );
    }

    async logout() {
        await this.waitElement(LoginLocator.dropdown_profile)
        await this.click(LoginLocator.dropdown_profile)
        await ReportManager.logStep(
            this.page,
            'Logout',
            'Click Logout',
            'Click Logout',
            'PASS'
        );
        await this.waitElement(LoginLocator.logout)
        await this.click(LoginLocator.logout)
        await this.waitElement(LoginLocator.loginButton)
        await ReportManager.logStep(
            this.page,
            'Success Logout',
            'Logout Account',
            'Logout Account',
            'PASS'
        );
    }
    

}