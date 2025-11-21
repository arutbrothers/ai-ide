import { chromium, Browser, Page } from 'playwright';

export class BrowserManager {
    private browser: Browser | null = null;
    private page: Page | null = null;

    public async launch(): Promise<void> {
        this.browser = await chromium.launch({ headless: false });
        this.page = await this.browser.newPage();
    }

    public async navigate(url: string): Promise<void> {
        if (this.page) {
            await this.page.goto(url);
        }
    }

    public async click(selector: string): Promise<void> {
        if (this.page) {
            await this.page.click(selector);
        }
    }

    public async type(selector: string, text: string): Promise<void> {
        if (this.page) {
            await this.page.fill(selector, text);
        }
    }

    public async screenshot(path: string): Promise<void> {
        if (this.page) {
            await this.page.screenshot({ path });
        }
    }
}
