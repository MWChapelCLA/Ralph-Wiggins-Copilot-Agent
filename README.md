# Ralph Wiggums Copilot Agent for VS Code

A VS Code Copilot Chat participant that implements the **Ralph Wiggum iterative development technique** - continuous AI loops for self-referential improvement.

## What is the Ralph Wiggum Technique?

The Ralph Wiggum technique is an iterative development methodology based on continuous AI loops, pioneered by Geoffrey Huntley.

**Core concept:**
The same prompt is fed to the AI repeatedly. The "self-referential" aspect comes from the AI seeing its own previous work in the files and git history, not from feeding output back as input.

**Each iteration:**
1. AI receives the SAME prompt
2. Works on the task, modifying files
3. AI sees its previous work in the files
4. Iteratively improves until completion

The technique is described as "deterministically bad in an undeterministic world" - failures are predictable, enabling systematic improvement through prompt tuning.

## Installation

### Option 1: Install Pre-packaged Extension (Recommended)

1. Download or clone this repository
2. Navigate to the `ralph-wiggums-copilot-agent` folder
3. Install the extension:
   ```bash
   code --install-extension ralph-wiggums-copilot-agent-0.1.0.vsix
   ```
4. Reload VS Code
5. Open Copilot Chat and type `@ralph`

### Option 2: Build and Install from Source

1. Clone or download this extension
2. Navigate to the folder:
   ```bash
   cd ralph-wiggums-copilot-agent
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile TypeScript:
   ```bash
   npm run compile
   ```
5. Package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```
6. Install the generated `.vsix` file:
   ```bash
   code --install-extension ralph-wiggums-copilot-agent-0.1.0.vsix
   ```
7. Reload VS Code
8. Open Copilot Chat and type `@ralph`

### Option 3: Development Mode

1. Clone or download this extension
2. Open the folder in VS Code
3. Run `npm install` to install dependencies
4. Run `npm run compile` to compile TypeScript
5. Press F5 to launch Extension Development Host
6. In the new window, open a workspace folder
7. Open Copilot Chat and type `@ralph`

## Usage

### Start a Ralph Loop

```
@ralph /loop Refactor the cache layer
@ralph /loop Add tests --max-iterations 20
@ralph /loop Fix auth bug --completion-promise "TESTS PASSING"
```

**Options:**
- `--max-iterations N` - Maximum iterations before auto-stop (default: unlimited)
- `--completion-promise "TEXT"` - Promise phrase to signal completion

### Check Status

```
@ralph /status
```

Shows current iteration, duration, and prompt.

### Cancel Loop

```
@ralph /cancel
```

Stops the active Ralph loop.

### Get Help

```
@ralph /help
```

Shows documentation about the Ralph Wiggum technique.

## Completion Promises

To signal that a task is complete, the AI must output a `<promise>` tag:

```
<promise>TASK COMPLETE</promise>
```

**Critical Rule:** The promise should ONLY be output when the statement is completely and unequivocally TRUE. Do not output false promises to escape the loop.

## Examples

### Interactive Bug Fix

```
@ralph /loop Fix the token refresh logic in auth.ts. Output <promise>FIXED</promise> when all tests pass. --completion-promise "FIXED" --max-iterations 10
```

### Continuous Refactoring

```
@ralph /loop Refactor the database layer to use async/await --max-iterations 15
```

### Feature Development

```
@ralph /loop Build a REST API for user management. Output <promise>API COMPLETE</promise> when all endpoints work. --completion-promise "API COMPLETE"
```

## How It Works

1. When you start a loop with `/loop`, a state file is created in `.ralph-loop/state.json`
2. The AI works on your task, making changes to files
3. Each iteration, the AI sees the same prompt but can review its previous work
4. The loop continues until:
   - The completion promise is detected in the response
   - Maximum iterations is reached
   - You manually cancel with `/cancel`

## State Management

The extension creates a `.ralph-loop/` directory in your workspace to store loop state:

```json
{
  "active": true,
  "iteration": 5,
  "maxIterations": 20,
  "completionPromise": "TESTS PASSING",
  "startedAt": "2024-01-09T10:30:00.000Z",
  "prompt": "Add comprehensive tests for the auth module"
}
```

This directory is automatically added to `.gitignore`.

## Status Bar Indicator

When a Ralph loop is active, you'll see a spinning sync icon in the status bar showing the current iteration:

```
🔄 Ralph Loop: 5
```

Click it to see detailed status information.

## Key Concepts

### Self-Reference Mechanism

The "loop" doesn't mean the AI talks to itself. It means:
- Same prompt repeated each iteration
- AI's work persists in files
- Each iteration sees previous attempts
- Builds incrementally toward goal

### When to Use Ralph Loops

✅ Good for:
- Complex refactoring tasks
- Iterative feature development
- Bug fixes that require multiple attempts
- Learning and experimentation

❌ Not ideal for:
- Simple, single-step tasks
- Tasks with unclear success criteria
- When you need human decision points

## Development

### Building

```bash
npm install
npm run compile
```

### Running

Press F5 in VS Code to launch the Extension Development Host.

### Testing

The extension works in any workspace with VS Code Copilot Chat enabled.

## Credits

The Ralph Wiggum technique was pioneered by Geoffrey Huntley. This VS Code extension brings the technique to Copilot Chat participants.

## License

MIT

## Contributing

Issues and pull requests welcome!
