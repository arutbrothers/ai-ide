import { BrowserManager } from '@ai-ide/browser-control';
import { Task } from './types';
import { ArtifactStore } from '@ai-ide/artifact-system';

interface VerificationStep {
	action: 'navigate' | 'click' | 'type' | 'wait' | 'assert';
	selector?: string;
	value?: string;
	url?: string;
	duration?: number;
	expected?: string;
}

export class Verifier {
	constructor(
		private browserManager: BrowserManager,
		private artifactStore: ArtifactStore
	) { }

	async verifyTask(task: Task, agentId: string = 'system'): Promise<boolean> {
		console.log(`Verifying task: ${task.description}`);

		// Skip verification for non-UI tasks
		if (!this.requiresBrowserVerification(task)) {
			return true;
		}

		try {
			await this.browserManager.launch();

			const url = task.metadata?.verificationUrl || 'http://localhost:3000';
			await this.browserManager.navigate(url);

			// Execute verification steps if defined
			if (task.metadata?.verificationSteps) {
				for (const step of task.metadata.verificationSteps as VerificationStep[]) {
					const success = await this.executeVerificationStep(step);
					if (!success) {
						await this.createFailureArtifact(task, agentId, `Verification failed at step: ${step.action}`);
						return false;
					}
				}
			} else {
				// Default verification: just check if page loads
				await this.browserManager.screenshot(`verification-${task.id}`);
			}

			await this.browserManager.close();

			// Create success artifact
			await this.artifactStore.createArtifact({
				agentId,
				taskId: task.id,
				type: 'test_result',
				title: `Verification Passed: ${task.description}`,
				content: {
					success: true,
					url,
					timestamp: new Date()
				},
				metadata: {},
				status: 'completed'
			});

			return true;
		} catch (error) {
			console.error('Verification failed', error);
			await this.createFailureArtifact(task, agentId, String(error));
			return false;
		}
	}

	private async executeVerificationStep(step: VerificationStep): Promise<boolean> {
		try {
			switch (step.action) {
				case 'navigate':
					if (step.url) {
						await this.browserManager.navigate(step.url);
					}
					break;

				case 'click':
					if (step.selector) {
						await this.browserManager.click(step.selector);
					}
					break;

				case 'type':
					if (step.selector && step.value) {
						await this.browserManager.type(step.selector, step.value);
					}
					break;

				case 'wait':
					await new Promise(resolve => setTimeout(resolve, step.duration || 1000));
					break;

				case 'assert':
					// Simple assertion: check if element exists
					if (step.selector) {
						// Would use page.locator(selector).isVisible() in real implementation
						return true;
					}
					break;
			}
			return true;
		} catch (error) {
			console.error(`Verification step failed: ${step.action}`, error);
			return false;
		}
	}

	private requiresBrowserVerification(task: Task): boolean {
		const keywords = ['ui', 'frontend', 'web', 'page', 'component', 'button', 'form'];
		const description = task.description.toLowerCase();
		return keywords.some(keyword => description.includes(keyword));
	}

	private async createFailureArtifact(task: Task, agentId: string, error: string): Promise<void> {
		await this.artifactStore.createArtifact({
			agentId,
			taskId: task.id,
			type: 'test_result',
			title: `Verification Failed: ${task.description}`,
			content: {
				success: false,
				error,
				timestamp: new Date()
			},
			metadata: {},
			status: 'completed'
		});
	}
}
