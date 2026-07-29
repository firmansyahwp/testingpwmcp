import { chromium, firefox, webkit, Browser, BrowserContext, LaunchOptions, Page, } from 'playwright';
import { BrowserSessionContext } from './types';

export class BrowserSession {

    private static browser: Browser | null = null;
    private static browserName: string | null = null;
    private static context: BrowserContext | null = null;
    private static page: Page | null = null;

    private static resolveHeadlessMode(options?: LaunchOptions): boolean {
        // Prioritas 1: caller
        if (typeof options?.headless === "boolean") {
            console.log("[resolveHeadlessMode] using caller:", options.headless);
            return options.headless;
        }
        // Prioritas 2: Playwright CLI
        if (process.argv.includes("--headed")) {
            console.log("[resolveHeadlessMode] detected --headed");
            return false;
        }
        if (process.argv.includes("--headless")) {
            console.log("[resolveHeadlessMode] detected --headless");
            return true;
        }
        // Prioritas 3: Environment Variable
        const envValue = process.env.PLAYWRIGHT_HEADLESS?.toLowerCase();
        console.log("[resolveHeadlessMode] env:", envValue);
        switch (envValue) {
            case "false":
            case "0":
            case "no":
                return false;
            case "true":
            case "1":
            case "yes":
                return true;
        }
        // Prioritas 4: Default
        console.log("[resolveHeadlessMode] using default: true");
        return true;
    }

    // Launch browser. if already launched, reuse existing session.
    static async launch( options?: LaunchOptions & { browserName?: string }, ): Promise<BrowserSessionContext> {
        console.log("Launching browser...");
        const requested = options?.browserName ?? 'chromium';
        // If a browser is already running with the same engine, reuse existing session.
        if (this.browser && this.browserName === requested) {
            return this.getSession();
        }
        // If a different engine is running, close it first.
        if (this.browser && this.browserName !== requested) {
            await this.close();
        }    
        const headless = this.resolveHeadlessMode(options);
        const launchOptions = {
            ...options,
            headless,
        };
        // Switch browser engine
        switch (requested) {
            case 'firefox':
                this.browser = await firefox.launch(launchOptions);
                break;
            case 'webkit':
                this.browser = await webkit.launch(launchOptions);
                break;
            default:
                this.browser = await chromium.launch(launchOptions);
                break;
        }
        this.browserName = requested;
        console.log(
            `[BrowserSession] Launching browser '${this.browserName}' with headless=${headless}`
        );
        this.context = await this.browser.newContext({
            ignoreHTTPSErrors: true,
        });
        this.page = await this.context.newPage();
        return this.getSession();
    }

    // Close the browser and reset the session.
    static async close(): Promise<void> {
        try {
            await this.page?.close().catch(() => {});
            await this.context?.close().catch(() => {});
            await this.browser?.close().catch(() => {});
        } finally {
            this.page = null;
            this.context = null;
            this.browser = null;
            this.browserName = null;
        }
    }

    // Current browser.
    static getBrowser(): Browser {
        if (!this.browser) {
            throw new Error('Browser has not been launched.',);       
        }
        return this.browser;
    }

    // Current browser context.
    static getContext(): BrowserContext {
        if (!this.context) {
            throw new Error('Browser context has not been created.',);  
        }
        return this.context;
    }

    // Current active page.
    static getPage(): Page {
        if (!this.page) {
            throw new Error('Browser page has not been created.',);
        }
        return this.page;
    }

    // Get current session.
    static getSession(): BrowserSessionContext {
        return {
            browser: this.browser,
            context: this.context,
            page: this.page,

        };
    }

    // Browser already running?
    static isRunning(): boolean {
        return this.browser !== null;
    }

    // Browser name
    static getBrowserName(): string | null {
        return this.browserName;
    }

    // Create a new tab
    static async newPage(): Promise<Page> {
        if (!this.context) {
            throw new Error('Browser context has not been created.',);
        }
        this.page = await this.context.newPage();
        return this.page;
    }

    // Reset session. Mainly for unit testing.
    static reset(): void {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

}