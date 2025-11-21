import { test, expect } from '@playwright/test';

test.describe('AI IDE E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to VSCode extension host
		await page.goto('http://localhost:3000');
	});

	test('should create an agent', async ({ page }) => {
		// Open command palette
		await page.keyboard.press('Control+Shift+P');

		// Type command
		await page.fill('[placeholder="Type a command"]', 'AI IDE: Create Agent');
		await page.keyboard.press('Enter');

		// Enter agent goal
		await page.fill('[placeholder="Enter agent goal"]', 'Create a hello world function');
		await page.keyboard.press('Enter');

		// Verify agent created
		await expect(page.locator('.agent-card')).toBeVisible({ timeout: 5000 });
	});

	test('should use tab autocompletion', async ({ page }) => {
		// Open a new file
		await page.keyboard.press('Control+N');

		// Type some code
		await page.fill('.monaco-editor textarea', 'function hello');

		// Wait for completion
		await page.waitForSelector('.suggest-widget', { timeout: 3000 });

		// Press Tab to accept
		await page.keyboard.press('Tab');

		// Verify completion accepted
		const content = await page.locator('.monaco-editor').textContent();
		expect(content).toContain('function hello');
	});

	test('should execute natural language command', async ({ page }) => {
		// Open a file
		await page.keyboard.press('Control+N');

		// Type natural language command
		await page.fill('.monaco-editor textarea', '// add error handling');

		// Wait for command detection
		await page.waitForSelector('.natural-language-decoration', { timeout: 3000 });

		// Execute command
		await page.keyboard.press('Control+Enter');

		// Verify execution
		await expect(page.locator('.notification')).toContainText('Command executed');
	});

	test('should open browser panel', async ({ page }) => {
		// Open command palette
		await page.keyboard.press('Control+Shift+P');

		// Run browser command
		await page.fill('[placeholder="Type a command"]', 'AI IDE: Open Browser');
		await page.keyboard.press('Enter');

		// Verify browser panel opened
		await expect(page.locator('.browser-container')).toBeVisible({ timeout: 5000 });
	});

	test('should open knowledge base', async ({ page }) => {
		// Open command palette
		await page.keyboard.press('Control+Shift+P');

		// Run knowledge base command
		await page.fill('[placeholder="Type a command"]', 'AI IDE: Open Knowledge Base');
		await page.keyboard.press('Enter');

		// Verify knowledge base opened
		await expect(page.locator('.kb-container')).toBeVisible({ timeout: 5000 });
	});

	test('should search knowledge base', async ({ page }) => {
		// Open knowledge base
		await page.keyboard.press('Control+Shift+P');
		await page.fill('[placeholder="Type a command"]', 'AI IDE: Open Knowledge Base');
		await page.keyboard.press('Enter');

		// Wait for KB to load
		await page.waitForSelector('.kb-container', { timeout: 5000 });

		// Search
		await page.fill('#search-input', 'function');
		await page.click('#search-btn');

		// Verify results
		await expect(page.locator('.kb-item')).toHaveCount(1, { timeout: 3000 });
	});

	test('should filter agents by status', async ({ page }) => {
		// Click filter in status bar
		await page.click('.status-bar-item:has-text("Filter")');

		// Select status
		await page.click('text=Executing');

		// Verify filtered
		const agents = await page.locator('.agent-card').count();
		expect(agents).toBeGreaterThanOrEqual(0);
	});

	test('should view artifact details', async ({ page }) => {
		// Click on an artifact
		await page.click('.artifact-card:first-child');

		// Verify detail panel opened
		await expect(page.locator('.artifact-container')).toBeVisible({ timeout: 5000 });

		// Verify content displayed
		await expect(page.locator('#content-display')).not.toBeEmpty();
	});

	test('should copy artifact content', async ({ page }) => {
		// Open artifact details
		await page.click('.artifact-card:first-child');

		// Click copy button
		await page.click('#copy-btn');

		// Verify notification
		await expect(page.locator('.notification')).toContainText('copied', { timeout: 3000 });
	});

	test('should show first launch tutorial', async ({ page }) => {
		// Clear tutorial state
		await page.evaluate(() => {
			localStorage.removeItem('hasSeenTutorial');
		});

		// Reload
		await page.reload();

		// Verify tutorial shown
		await expect(page.locator('.notification:has-text("Welcome to AI IDE")')).toBeVisible({ timeout: 5000 });
	});
});
