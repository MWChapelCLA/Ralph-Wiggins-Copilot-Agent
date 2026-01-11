import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface RalphLoopState {
  active: boolean;
  iteration: number;
  maxIterations: number;
  completionPromise: string | null;
  startedAt: string;
  prompt: string;
}

interface RalphLoopOptions {
  maxIterations?: number;
  completionPromise?: string;
}

const RALPH_STATE_DIR = '.ralph-loop';
const RALPH_STATE_FILE = 'state.json';

export class RalphLoopManager {
  private stateFilePath: string | null = null;

  constructor(private workspaceRoot: string) {
    this.stateFilePath = path.join(workspaceRoot, RALPH_STATE_DIR, RALPH_STATE_FILE);
  }

  /**
   * Start a new Ralph loop
   */
  async startLoop(prompt: string, options: RalphLoopOptions = {}): Promise<void> {
    if (!this.workspaceRoot) {
      throw new Error('No workspace folder open');
    }

    const state: RalphLoopState = {
      active: true,
      iteration: 1,
      maxIterations: options.maxIterations || 0,
      completionPromise: options.completionPromise || null,
      startedAt: new Date().toISOString(),
      prompt: prompt
    };

    // Create state directory
    const stateDir = path.join(this.workspaceRoot, RALPH_STATE_DIR);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    // Write state file
    fs.writeFileSync(this.stateFilePath!, JSON.stringify(state, null, 2));

    // Add to .gitignore
    await this.addToGitignore();
  }

  /**
   * Cancel the active Ralph loop
   */
  cancelLoop(): boolean {
    if (!this.stateFilePath || !fs.existsSync(this.stateFilePath)) {
      return false;
    }

    const state = this.getState();
    fs.unlinkSync(this.stateFilePath);

    // Clean up directory if empty
    const stateDir = path.dirname(this.stateFilePath);
    if (fs.existsSync(stateDir) && fs.readdirSync(stateDir).length === 0) {
      fs.rmdirSync(stateDir);
    }

    return true;
  }

  /**
   * Get current loop state
   */
  getState(): RalphLoopState | null {
    if (!this.stateFilePath || !fs.existsSync(this.stateFilePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.stateFilePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if loop is active
   */
  isActive(): boolean {
    const state = this.getState();
    return state?.active || false;
  }

  /**
   * Increment iteration counter
   */
  incrementIteration(): void {
    const state = this.getState();
    if (state) {
      state.iteration++;
      fs.writeFileSync(this.stateFilePath!, JSON.stringify(state, null, 2));
    }
  }

  /**
   * Check if loop should continue
   */
  shouldContinue(response: string): { continue: boolean; reason: string } {
    const state = this.getState();
    if (!state || !state.active) {
      return { continue: false, reason: 'No active loop' };
    }

    // Check for completion promise
    if (state.completionPromise) {
      const promiseRegex = new RegExp(`<promise>\\s*${state.completionPromise}\\s*</promise>`, 'i');
      if (promiseRegex.test(response)) {
        return { continue: false, reason: 'Completion promise detected' };
      }
    }

    // Check max iterations
    if (state.maxIterations > 0 && state.iteration >= state.maxIterations) {
      return { continue: false, reason: 'Max iterations reached' };
    }

    return { continue: true, reason: 'Loop continues' };
  }

  /**
   * Add Ralph Loop directory to .gitignore
   */
  private async addToGitignore(): Promise<void> {
    const gitignorePath = path.join(this.workspaceRoot, '.gitignore');
    const ignoreEntry = `\n# Ralph Loop Agent\n${RALPH_STATE_DIR}/\n`;

    try {
      let content = '';
      if (fs.existsSync(gitignorePath)) {
        content = fs.readFileSync(gitignorePath, 'utf-8');
      }

      if (!content.includes(RALPH_STATE_DIR)) {
        fs.appendFileSync(gitignorePath, ignoreEntry);
      }
    } catch (error) {
      console.error('Failed to update .gitignore:', error);
    }
  }
}
