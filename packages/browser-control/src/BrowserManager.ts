import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ArtifactStore } from '@ai-ide/artifact-system';

interface BrowserStep {
	action: 'navigate' | 'click' | 'type' | 'wait';
	name: string;
	url?: string;
	selector?: string;
	text?: string;
	duration?: number;
}

export class BrowserManager {
	private browser: Browser | null = null;
	private context: BrowserContext | null = null;
	private page: Page | null = null;
	private recording: boolean = false;

	constructor(private artifactStore: ArtifactStore) { }

	async launch(): Promise<void> {
		if (this.browser) return;

		this.browser = await chromium.launch({
			headless: false,
			args: ['--disable-web-security'],
		});

		this.context = await this.browser.newContext({
			recordVideo: {
				dir: './artifacts/videos/',
				size: { width: 1280, height: 720 }
			}
		});

		this.page = await this.context.newPage();
	}

	async navigate(url: string): Promise<void> {
		if (!this.page) throw new Error('Browser not launched');
		await this.page.goto(url);

		await this.artifactStore.createArtifact({
			agentId: 'system',
			type: 'browser_action',
			title: `Navigated to ${url}`,
			content: { action: 'navigate', url, timestamp: new Date() },
			metadata: {},
			status: 'completed'
		});
	}

	async click(selector: string): Promise<void> {
		if (!this.page) throw new Error('Browser not launched');

		// Highlight element before clicking
		await this.page.evaluate((sel) => {
			const el = document.querySelector(sel);
			if (el instanceof HTMLElement) {
				el.style.outline = '3px solid red';
				setTimeout(() => el.style.outline = '', 1000);
			}
		}, selector);

		await this.page.click(selector);

		await this.artifactStore.createArtifact({
			agentId: 'system',
			type: 'browser_action',
			title: `Clicked ${selector}`,
			content: { action: 'click', selector, timestamp: new Date() },
			metadata: {},
			status: 'completed'
		});
	}

	async type(selector: string, text: string): Promise<void> {
		if (!this.page) throw new Error('Browser not launched');
		await this.page.fill(selector, text);

		await this.artifactStore.createArtifact({
			agentId: 'system',
			type: 'browser_action',
			title: `Typed into ${selector}`,
			content: { action: 'type', selector, text, timestamp: new Date() },
			metadata: {},
			status: 'completed'
		});
	}

	async screenshot(name: string): Promise<string> {
		if (!this.page) throw new Error('Browser not launched');

		const path = `./artifacts/screenshots/${name}-${Date.now()}.png`;
		await this.page.screenshot({ path, fullPage: false });

		const artifact = await this.artifactStore.createArtifact({
			agentId: 'system',
			type: 'screenshot',
			title: `Screenshot: ${name}`,
			content: { path, url: this.page.url() },
			metadata: { timestamp: new Date() },
			status: 'completed'
		});

		return artifact.id;
	}

	async startRecording(): Promise<void> {
		this.recording = true;
	}

	async stopRecording(): Promise<string> {
		this.recording = false;

		const videoPath = await this.page?.video()?.path();

		if (videoPath) {
			const artifact = await this.artifactStore.createArtifact({
				agentId: 'system',
				type: 'walkthrough_recording',
				title: 'Browser Recording',
				content: { path: videoPath, duration: 15 },
				metadata: { timestamp: new Date() },
				status: 'completed'
			});

			return artifact.id;
		}

		throw new Error('No recording available');
	}

	async createWalkthrough(steps: BrowserStep[]): Promise<string> {
		await this.startRecording();
		const screenshots: string[] = [];

		for (const step of steps) {
			switch (step.action) {
				case 'navigate':
					await this.navigate(step.url!);
					break;
				case 'click':
					await this.click(step.selector!);
					break;
				case 'type':
					await this.type(step.selector!, step.text!);
					break;
				case 'wait':
					await this.page?.waitForTimeout(step.duration || 1000);
					break;
			}

			const screenshotId = await this.screenshot(`step-${step.name}`);
			screenshots.push(screenshotId);
		}

		const recordingId = await this.stopRecording();

		const artifact = await this.artifactStore.createArtifact({
			agentId: 'system',
			type: 'walkthrough_recording',
			title: 'Complete Walkthrough',
			content: { steps, recordingId, screenshots },
			metadata: { timestamp: new Date() },
			status: 'completed'
		});

		return artifact.id;
	}

	async close(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
			this.context = null;
			this.page = null;
		}
	}
}
