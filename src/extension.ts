import * as vscode from 'vscode';
import { RalphLoopManager } from './ralphLoopManager';

const RALPH_PARTICIPANT_ID = 'ralph-loop-agent.ralph';

interface RalphChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  };
}

export function activate(context: vscode.ExtensionContext) {
  // Get workspace root
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage('Ralph Loop Agent requires an open workspace folder');
    return;
  }

  const ralphManager = new RalphLoopManager(workspaceFolder.uri.fsPath);

  // Register the chat participant
  const ralph = vscode.chat.createChatParticipant(RALPH_PARTICIPANT_ID, async (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<RalphChatResult> => {
    
    // Handle different commands
    if (request.command === 'help') {
      return handleHelpCommand(stream);
    } else if (request.command === 'loop') {
      return handleLoopCommand(request, stream, ralphManager);
    } else if (request.command === 'cancel') {
      return handleCancelCommand(stream, ralphManager);
    } else if (request.command === 'status') {
      return handleStatusCommand(stream, ralphManager);
    } else {
      // Default behavior - check if loop is active
      return handleDefaultBehavior(request, stream, ralphManager, context);
    }
  });

  ralph.iconPath = vscode.Uri.file(context.asAbsolutePath('assets/ralph-icon.png'));

  context.subscriptions.push(ralph);

  // Status bar item for active loop
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'ralph-loop-agent.showStatus';
  context.subscriptions.push(statusBarItem);

  // Register command to show status
  context.subscriptions.push(
    vscode.commands.registerCommand('ralph-loop-agent.showStatus', () => {
      const state = ralphManager.getState();
      if (state) {
        vscode.window.showInformationMessage(
          `Ralph Loop Active - Iteration: ${state.iteration}/${state.maxIterations || '∞'}`
        );
      } else {
        vscode.window.showInformationMessage('No active Ralph loop');
      }
    })
  );

  // Update status bar periodically
  const updateStatusBar = () => {
    if (ralphManager.isActive()) {
      const state = ralphManager.getState();
      statusBarItem.text = `$(sync~spin) Ralph Loop: ${state?.iteration || 0}`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  updateStatusBar();
  setInterval(updateStatusBar, 2000);
}

function handleHelpCommand(stream: vscode.ChatResponseStream): RalphChatResult {
  stream.markdown(`# Ralph Wiggum Technique

The Ralph Wiggum technique is an **iterative development methodology** based on continuous AI loops, pioneered by Geoffrey Huntley.

## Core Concept

The same prompt is fed to the AI repeatedly. The "self-referential" aspect comes from the AI seeing its own previous work in the files and git history, not from feeding output back as input.

**Each iteration:**
1. AI receives the SAME prompt
2. Works on the task, modifying files
3. AI sees its previous work in the files
4. Iteratively improves until completion

The technique is described as "deterministically bad in an undeterministic world" - failures are predictable, enabling systematic improvement through prompt tuning.

## Commands

### \`/loop\`
Start a Ralph loop with a prompt.

**Usage:**
- \`@ralph /loop Refactor the cache layer\`
- \`@ralph /loop Add tests --max-iterations 20\`
- \`@ralph /loop Fix auth bug --completion-promise "TESTS PASSING"\`

**Options:**
- \`--max-iterations N\` - Maximum iterations before auto-stop
- \`--completion-promise "TEXT"\` - Promise phrase to signal completion

### \`/cancel\`
Cancel the active Ralph loop.

### \`/status\`
Show current loop status and iteration count.

## Completion Promises

To signal completion, output a \`<promise>\` tag:

\`\`\`
<promise>TASK COMPLETE</promise>
\`\`\`

**Critical Rule:** Only output the promise when the statement is completely and unequivocally TRUE. Do not output false promises to escape the loop.

## Example

\`\`\`
@ralph /loop Fix token refresh logic. Output <promise>FIXED</promise> when tests pass --completion-promise "FIXED" --max-iterations 10
\`\`\`
`);

  return { metadata: { command: 'help' } };
}

async function handleLoopCommand(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  ralphManager: RalphLoopManager
): Promise<RalphChatResult> {
  // Check if loop is already active
  if (ralphManager.isActive()) {
    stream.markdown('❌ A Ralph loop is already active. Use `/cancel` to stop it first.');
    return { metadata: { command: 'loop' } };
  }

  // Parse the prompt and options
  const text = request.prompt.trim();
  const args = parseLoopArguments(text);

  if (!args.prompt) {
    stream.markdown('❌ Error: No prompt provided.\n\nUsage: `@ralph /loop <prompt> [--max-iterations N] [--completion-promise "TEXT"]`');
    return { metadata: { command: 'loop' } };
  }

  // Start the loop
  try {
    await ralphManager.startLoop(args.prompt, {
      maxIterations: args.maxIterations,
      completionPromise: args.completionPromise
    });

    stream.markdown(`🔄 **Ralph loop activated!**

**Iteration:** 1
**Max iterations:** ${args.maxIterations || 'unlimited'}
**Completion promise:** ${args.completionPromise || 'none (runs forever)'}

The loop is now active. I'll work on this task iteratively, seeing my previous work in the files to continuously improve.

`);

    if (args.completionPromise) {
      stream.markdown(`
═══════════════════════════════════════════════════════════
**CRITICAL - Completion Promise**
═══════════════════════════════════════════════════════════

To complete this loop, I must output:
\`\`\`
<promise>${args.completionPromise}</promise>
\`\`\`

**Requirements:**
- The statement MUST be completely and unequivocally TRUE
- Do NOT output false statements to exit the loop
- Trust the process - the loop continues until genuinely complete
═══════════════════════════════════════════════════════════

`);
    }

    stream.markdown(`---\n\n**Working on:** ${args.prompt}\n\n`);

    // Now actually work on the task
    stream.markdown('Starting work...\n\n');

  } catch (error) {
    stream.markdown(`❌ Error starting Ralph loop: ${error}`);
  }

  return { metadata: { command: 'loop' } };
}

function handleCancelCommand(
  stream: vscode.ChatResponseStream,
  ralphManager: RalphLoopManager
): RalphChatResult {
  const state = ralphManager.getState();
  
  if (!state) {
    stream.markdown('No active Ralph loop to cancel.');
    return { metadata: { command: 'cancel' } };
  }

  const success = ralphManager.cancelLoop();
  
  if (success) {
    stream.markdown(`✅ Ralph loop cancelled after ${state.iteration} iteration(s).`);
  } else {
    stream.markdown('❌ Failed to cancel Ralph loop.');
  }

  return { metadata: { command: 'cancel' } };
}

function handleStatusCommand(
  stream: vscode.ChatResponseStream,
  ralphManager: RalphLoopManager
): RalphChatResult {
  const state = ralphManager.getState();

  if (!state) {
    stream.markdown('No active Ralph loop.');
    return { metadata: { command: 'status' } };
  }

  const duration = Math.round((Date.now() - new Date(state.startedAt).getTime()) / 1000 / 60);

  stream.markdown(`## Ralph Loop Status

**Status:** 🟢 Active
**Iteration:** ${state.iteration}${state.maxIterations > 0 ? ` / ${state.maxIterations}` : ''}
**Duration:** ${duration} minutes
**Started:** ${new Date(state.startedAt).toLocaleString()}
**Completion Promise:** ${state.completionPromise || 'None'}

**Prompt:**
\`\`\`
${state.prompt}
\`\`\`
`);

  return { metadata: { command: 'status' } };
}

async function handleDefaultBehavior(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  ralphManager: RalphLoopManager,
  context: vscode.ChatContext
): Promise<RalphChatResult> {
  // Check if there's an active loop
  const state = ralphManager.getState();

  if (state && state.active) {
    // We're in a loop - continue working on the same prompt
    stream.markdown(`**Ralph Loop - Iteration ${state.iteration}**\n\n`);
    
    // Here you would integrate with Copilot's actual response
    // For now, just acknowledge
    stream.markdown(`Continuing work on: ${state.prompt}\n\n`);
    stream.markdown(`*(This is where I would analyze previous work and continue iterating...)*\n\n`);

    // Check if we should continue
    const { continue: shouldContinue, reason } = ralphManager.shouldContinue(request.prompt);

    if (!shouldContinue) {
      stream.markdown(`\n\n---\n\n✅ **Loop completed:** ${reason}\n\n`);
      ralphManager.cancelLoop();
    } else {
      // Increment iteration for next time
      ralphManager.incrementIteration();
      stream.markdown(`\n\n🔄 Loop continues to iteration ${state.iteration + 1}...\n`);
    }
  } else {
    // No active loop - just respond normally
    stream.markdown(`Hi! I'm Ralph, the iterative development agent.

Use \`@ralph /help\` to learn about the Ralph Wiggum technique, or \`@ralph /loop <prompt>\` to start an iterative development loop.`);
  }

  return { metadata: { command: 'default' } };
}

function parseLoopArguments(text: string): {
  prompt: string;
  maxIterations?: number;
  completionPromise?: string;
} {
  let prompt = text;
  let maxIterations: number | undefined;
  let completionPromise: string | undefined;

  // Parse --max-iterations
  const maxIterMatch = text.match(/--max-iterations\s+(\d+)/);
  if (maxIterMatch) {
    maxIterations = parseInt(maxIterMatch[1], 10);
    prompt = prompt.replace(/--max-iterations\s+\d+/, '').trim();
  }

  // Parse --completion-promise
  const promiseMatch = text.match(/--completion-promise\s+"([^"]+)"/);
  if (promiseMatch) {
    completionPromise = promiseMatch[1];
    prompt = prompt.replace(/--completion-promise\s+"[^"]+"/, '').trim();
  }

  return { prompt, maxIterations, completionPromise };
}

export function deactivate() {}
