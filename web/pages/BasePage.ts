import { Page, Locator, expect } from '@playwright/test';

export class BasePage {

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // =========================================
    // NAVIGATION
    // =========================================

    async navigate(url: string) {
        await this.page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
    }

    async refreshPage() {
        await this.page.reload();
    }

    async backPage() {
        await this.page.goBack();
    }

    // =========================================
    // BASIC ACTION
    // =========================================

    async click(locator: string) {
        await this.page.locator(locator).click();
    }

    async type(locator: string, value: string) {
        await this.page.locator(locator).fill(value);
    }

    async clear(locator: string) {
        await this.page.locator(locator).clear();
    }

    async press(locator: string, key: string) {
        await this.page.locator(locator).press(key);
    }

    async hover(locator: string) {
        await this.page.locator(locator).hover();
    }

    async doubleClick(locator: string) {
        await this.page.locator(locator).dblclick();
    }

    // =========================================
    // WAITING
    // =========================================

    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitElement(locator: string) {
        
        await this.page.locator(locator).waitFor({
            state: 'visible'
        });
        
    }

    async waitHidden(locator: string) {
        await this.page.locator(locator).waitFor({
            state: 'hidden'
        });
    }

    async waitLoadingComplete() {
        await this.page.waitForLoadState('load');
    }

    // =========================================
    // GET DATA
    // =========================================

    async getText(locator: string): Promise<string> {
        return await this.page.locator(locator).innerText();
    }

    async getValue(locator: string): Promise<string> {
        return await this.page.locator(locator).inputValue();
    }

    async isVisible(locator: string): Promise<boolean> {
        return await this.page.locator(locator).isVisible();
    }

    // =========================================
    // ASSERTION
    // =========================================

    async verifyURL(expectedUrl: string) {
        await expect(this.page).toHaveURL(expectedUrl);
    }

    async verifyText(locator: string, expectedText: string) {
        await expect(this.page.locator(locator))
            .toContainText(expectedText);
    }

    async verifyVisible(locator: string) {
        await expect(this.page.locator(locator))
            .toBeVisible();
    }

    // =========================================
    // ADVANCED ACTION
    // =========================================

    async scrollIntoView(locator: string) {
        await this.page.locator(locator).scrollIntoViewIfNeeded();
    }

    async uploadFile(locator: string, filePath: string) {
        await this.page.locator(locator).setInputFiles(filePath);
    }

    async selectDropdown(locator: string, value: string) {
        await this.page.locator(locator).selectOption(value);
    }

    async dragAndDrop(source: string, target: string) {
        await this.page.locator(source)
            .dragTo(this.page.locator(target));
    }

    async jsClick(locator: string) {
        await this.page.locator(locator).evaluate((el: any) => el.click());
    }


    // =========================================
    // ALERT
    // =========================================

    async acceptAlert() {
        this.page.on('dialog', async dialog => {
            await dialog.accept();
        });
    }

    async dismissAlert() {
        this.page.on('dialog', async dialog => {
            await dialog.dismiss();
        });
    }

    // =========================================
    // RETRY CLICK
    // =========================================

    async retryClick(locator: string, retry = 3) {
        for (let i = 0; i < retry; i++) {
            try {
                await this.page.locator(locator).click();
                break;
            } catch (error) {
                if (i === retry - 1) {
                    throw error;
                }
            }
        }
    }
    
}