import { ArtifactStore } from './ArtifactStore';
import { Comment } from './types';
import { ModelProvider } from '@ai-ide/model-provider';

interface CommentPosition {
	line?: number;
	x?: number;
	y?: number;
}

export class CommentSystem {
	private pollInterval: NodeJS.Timeout | null = null;

	constructor(
		private store: ArtifactStore,
		private modelProvider?: ModelProvider
	) { }

	// Start polling for new comments (agent checks every 10s)
	startPolling(agentId: string, onNewComments: (comments: Comment[]) => void): void {
		this.pollInterval = setInterval(async () => {
			const newComments = await this.getUnreadComments(agentId);

			if (newComments.length > 0) {
				onNewComments(newComments);
				await this.processComments(agentId, newComments);
			}
		}, 10000); // 10 seconds
	}

	stopPolling(): void {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
		}
	}

	async addComment(
		artifactId: string,
		userId: string,
		content: string,
		position?: CommentPosition
	): Promise<Comment> {
		const comment = await this.store.addComment({
			artifactId,
			userId,
			content,
			position,
			resolved: false
		});

		// Notify agent if human commented
		if (userId !== 'agent') {
			await this.notifyAgent(artifactId, comment);
		}

		return comment;
	}

	async resolveComment(artifactId: string, commentId: string): Promise<void> {
		// Mark comment as resolved
		// This would require extending ArtifactStore with updateComment method
		console.log(`Resolving comment ${commentId} on artifact ${artifactId}`);
	}

	private async getUnreadComments(agentId: string): Promise<Comment[]> {
		// Get all artifacts for this agent
		const artifacts = await this.store.listArtifacts(agentId);
		const unreadComments: Comment[] = [];

		for (const artifact of artifacts) {
			const comments = await this.store.getComments(artifact.id);
			// Filter for unresolved comments from humans
			unreadComments.push(...comments.filter(c => !c.resolved && c.userId !== 'agent'));
		}

		return unreadComments;
	}

	private async processComments(agentId: string, comments: Comment[]): Promise<void> {
		if (!this.modelProvider) return;

		for (const comment of comments) {
			// Call LLM to understand comment and generate response
			const prompt = `
        User commented on your work: "${comment.content}"

        Respond with:
        1. A brief acknowledgment message
        2. Any actions you'll take based on this feedback
      `;

			const response = await this.modelProvider.generate(prompt, {
				temperature: 0.7,
				maxTokens: 200
			});

			// Reply to comment
			await this.addComment(
				comment.artifactId,
				'agent',
				response.content,
				comment.position
			);

			// Mark as resolved
			await this.resolveComment(comment.artifactId, comment.id);
		}
	}

	private async notifyAgent(artifactId: string, comment: Comment): Promise<void> {
		// Emit event or call webhook to notify agent of new comment
		console.log(`New comment on artifact ${artifactId}:`, comment.content);
	}
}
