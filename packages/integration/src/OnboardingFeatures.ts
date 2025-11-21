import * as vscode from 'vscode';

export interface TutorialStep {
	id: string;
	title: string;
	description: string;
	action?: string;
	command?: string;
	validation?: () => Promise<boolean>;
}

export class FirstLaunchTutorial {
	private currentStep: number = 0;
	private steps: TutorialStep[] = [
		{
			id: 'welcome',
			title: 'Welcome to AI IDE!',
			description: 'Let\'s take a quick tour of the key features. This will only take 2 minutes.',
			action: 'Click "Next" to continue'
		},
		{
			id: 'create-agent',
			title: 'Create Your First Agent',
			description: 'Agents are AI assistants that help you code. Let\'s create one!',
			action: 'Open the Command Palette (Ctrl+Shift+P) and type "AI IDE: Create Agent"',
			command: 'aiide.createAgent'
		},
		{
			id: 'natural-language',
			title: 'Natural Language Commands',
			description: 'You can use comments to give instructions to the AI.',
			action: 'Try typing: // add error handling\nThe AI will detect and execute this command.',
		},
		{
			id: 'tab-completion',
			title: 'Tab Autocompletion',
			description: 'Get AI-powered code suggestions as you type.',
			action: 'Start typing in any file and press Tab to accept suggestions.'
		},
		{
			id: 'browser-panel',
			title: 'Browser Integration',
			description: 'Control a browser directly from VSCode for web testing.',
			action: 'Open Command Palette and run "AI IDE: Open Browser"',
			command: 'aiide.openBrowser'
		},
		{
			id: 'knowledge-base',
			title: 'Knowledge Base',
			description: 'Store and search code patterns, functions, and concepts.',
			action: 'Open Command Palette and run "AI IDE: Open Knowledge Base"',
			command: 'aiide.openKnowledgeBase'
		},
		{
			id: 'complete',
			title: 'You\'re All Set!',
			description: 'You\'ve completed the tutorial. Start coding with AI assistance!',
			action: 'Click "Finish" to close this tutorial'
		}
	];

	async start(context: vscode.ExtensionContext): Promise<void> {
		const hasSeenTutorial = context.globalState.get('hasSeenTutorial', false);

		if (hasSeenTutorial) {
			const result = await vscode.window.showInformationMessage(
				'Would you like to see the tutorial again?',
				'Yes',
				'No'
			);

			if (result !== 'Yes') {
				return;
			}
		}

		this.currentStep = 0;
		await this.showStep(context);
	}

	private async showStep(context: vscode.ExtensionContext): Promise<void> {
		if (this.currentStep >= this.steps.length) {
			await context.globalState.update('hasSeenTutorial', true);
			vscode.window.showInformationMessage('Tutorial completed! 🎉');
			return;
		}

		const step = this.steps[this.currentStep];
		const buttons = this.currentStep === this.steps.length - 1
			? ['Finish']
			: this.currentStep === 0
				? ['Next', 'Skip Tutorial']
				: ['Next', 'Previous', 'Skip Tutorial'];

		const result = await vscode.window.showInformationMessage(
			`${step.title}\n\n${step.description}\n\n${step.action || ''}`,
			...buttons
		);

		if (result === 'Next' || result === 'Finish') {
			if (step.command) {
				await vscode.commands.executeCommand(step.command);
			}
			this.currentStep++;
			await this.showStep(context);
		} else if (result === 'Previous') {
			this.currentStep = Math.max(0, this.currentStep - 1);
			await this.showStep(context);
		} else if (result === 'Skip Tutorial') {
			await context.globalState.update('hasSeenTutorial', true);
		}
	}

	async reset(context: vscode.ExtensionContext): Promise<void> {
		await context.globalState.update('hasSeenTutorial', false);
		vscode.window.showInformationMessage('Tutorial reset. It will show on next launch.');
	}
}

export interface ExampleTask {
	id: string;
	name: string;
	description: string;
	category: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	goal: string;
	expectedFiles?: string[];
}

export class ExampleTasksLibrary {
	private tasks: ExampleTask[] = [
		{
			id: 'hello-world',
			name: 'Hello World API',
			description: 'Create a simple REST API with a hello world endpoint',
			category: 'Backend',
			difficulty: 'beginner',
			goal: 'Create a Node.js Express server with a GET /hello endpoint that returns "Hello, World!"',
			expectedFiles: ['server.js', 'package.json']
		},
		{
			id: 'todo-app',
			name: 'Todo List App',
			description: 'Build a full-stack todo list application',
			category: 'Full Stack',
			difficulty: 'intermediate',
			goal: 'Create a todo list app with React frontend and Node.js backend, supporting CRUD operations',
			expectedFiles: ['frontend/App.tsx', 'backend/server.js', 'backend/routes/todos.js']
		},
		{
			id: 'auth-system',
			name: 'Authentication System',
			description: 'Implement JWT-based authentication',
			category: 'Backend',
			difficulty: 'intermediate',
			goal: 'Create a secure authentication system with JWT tokens, password hashing, and protected routes',
			expectedFiles: ['auth/middleware.js', 'auth/controller.js', 'models/User.js']
		},
		{
			id: 'data-visualization',
			name: 'Data Dashboard',
			description: 'Create an interactive data visualization dashboard',
			category: 'Frontend',
			difficulty: 'advanced',
			goal: 'Build a dashboard with charts, graphs, and real-time data updates using React and D3.js',
			expectedFiles: ['components/Dashboard.tsx', 'components/Chart.tsx', 'utils/dataProcessor.ts']
		},
		{
			id: 'microservice',
			name: 'Microservice Architecture',
			description: 'Design a microservices-based system',
			category: 'Architecture',
			difficulty: 'advanced',
			goal: 'Create a microservices architecture with API gateway, service discovery, and inter-service communication',
			expectedFiles: ['gateway/index.js', 'services/user-service/index.js', 'services/order-service/index.js']
		},
		{
			id: 'testing-suite',
			name: 'Comprehensive Testing',
			description: 'Set up unit, integration, and E2E tests',
			category: 'Testing',
			difficulty: 'intermediate',
			goal: 'Create a complete testing suite with Jest for unit tests, Supertest for API tests, and Playwright for E2E tests',
			expectedFiles: ['tests/unit/user.test.js', 'tests/integration/api.test.js', 'tests/e2e/flow.spec.js']
		}
	];

	async showLibrary(): Promise<ExampleTask | undefined> {
		const categories = [...new Set(this.tasks.map(t => t.category))];

		const category = await vscode.window.showQuickPick(
			['All', ...categories],
			{ placeHolder: 'Select a category' }
		);

		if (!category) return;

		const filteredTasks = category === 'All'
			? this.tasks
			: this.tasks.filter(t => t.category === category);

		const items = filteredTasks.map(task => ({
			label: `$(${this.getDifficultyIcon(task.difficulty)}) ${task.name}`,
			description: task.description,
			detail: `${task.category} • ${task.difficulty}`,
			task
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select an example task'
		});

		return selected?.task;
	}

	private getDifficultyIcon(difficulty: string): string {
		const icons = {
			beginner: 'star',
			intermediate: 'star-full',
			advanced: 'flame'
		};
		return icons[difficulty as keyof typeof icons] || 'circle';
	}

	async createTask(task: ExampleTask, agentService: any): Promise<void> {
		const confirm = await vscode.window.showInformationMessage(
			`Create agent for: ${task.name}?\n\n${task.goal}`,
			'Create',
			'Cancel'
		);

		if (confirm === 'Create') {
			try {
				await agentService.createAgent(task.goal, {
					name: task.name,
					autoApprove: false
				});
				vscode.window.showInformationMessage(`Agent created for: ${task.name}`);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to create agent: ${error}`);
			}
		}
	}
}
