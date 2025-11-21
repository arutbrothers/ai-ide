import { ModelProvider } from '@ai-ide/model-provider';

export class InlineCompletionProvider {
	constructor(private modelProvider: ModelProvider) { }

	async provideCompletion(document: string, position: number, context: string): Promise<string> {
		// Construct prompt for code completion
		const prefix = document.substring(0, position);
		const suffix = document.substring(position);

		const prompt = `<|fim_prefix|>${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`;

		const response = await this.modelProvider.generate(prompt, {
			maxTokens: 50,
			stop: ['\n', '<|file_separator|>'],
			temperature: 0.1
		});

		return response.content;
	}
}
