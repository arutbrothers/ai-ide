import { Planner } from './Planner';
import { Executor } from './Executor';
import * as vscode from 'vscode';
import { Planner } from './Planner';
import { Executor } from './Executor';
import { Verifier } from './Verifier';

export type AgentState = 'idle' | 'planning' | 'awaiting_approval' | 'executing' | 'paused' | 'completed' | 'failed';

export class Agent {
    private _state: AgentState = 'idle';
    private _planner = new Planner();
    private _executor = new Executor();
    private _verifier = new Verifier();

    constructor(public readonly id: string) {}

    public get state(): AgentState {
        return this._state;
    }

    public setState(state: AgentState) {
        this._state = state;
        console.log(`Agent ${this.id} state changed to: ${this._state}`);
    }

    public async executeTask(intent: string): Promise<void> {
        try {
            this.setState('planning');
            const plan = await this._planner.createPlan(intent);

            await vscode.commands.executeCommand('artifact-system.create', {
                id: `${this.id}-plan`,
                type: 'Implementation Plan',
                agent_id: this.id,
                content: plan
            });

            this.setState('awaiting_approval');
            // In a real implementation, we would wait for human approval here.

            this.setState('executing');
            for (const step of plan.steps) {
                await this._executor.executeStep(step);
            }

            await vscode.commands.executeCommand('browser-panel.screenshot', `${this.id}-verification.png`);

            const verificationResult = await this._verifier.verify();
            if (verificationResult) {
                this.setState('completed');
            } else {
                this.setState('failed');
            }
        } catch (error) {
            this.setState('failed');
            console.error(`Agent ${this.id} failed to execute task:`, error);
        }
    }
}
