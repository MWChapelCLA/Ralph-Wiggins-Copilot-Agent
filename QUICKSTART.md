# Ralph Loop Agent - VS Code Copilot Extension

## Quick Start (Option 2: Build and Install from Source)

1. **Navigate to the extension folder:**
   ```bash
   cd ralph-loop-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the extension:**
   ```bash
   npm run compile
   ```

4. **Install packaging tool:**
   ```bash
   npm install -g @vscode/vsce
   ```

5. **Package the extension:**
   ```bash
   vsce package --allow-missing-repository
   ```
   This creates `ralph-loop-agent-0.1.0.vsix`

6. **Install the extension:**
   ```bash
   code --install-extension ralph-loop-agent-0.1.0.vsix
   ```

7. **Reload VS Code:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Developer: Reload Window"
   - Press Enter

8. **Try it out:**
   - Open Copilot Chat
   - Type `@ralph /help`
   - Start a loop: `@ralph /loop Your task here`

## Alternative: Development Mode

If you want to test changes without installing:
- Press `F5` in VS Code
- This opens an Extension Development Host window
- Open a workspace folder in the new window
- Use `@ralph` commands there

## Commands

- `@ralph /help` - Show documentation
- `@ralph /loop <prompt>` - Start a Ralph loop
- `@ralph /status` - Check current loop status
- `@ralph /cancel` - Stop the active loop

## Options for /loop

- `--max-iterations N` - Limit iterations
- `--completion-promise "TEXT"` - Set completion phrase

## Example

```
@ralph /loop Refactor the database layer --max-iterations 20 --completion-promise "REFACTORING COMPLETE"
```

## Verify Installation

Check that the extension is installed:
```bash
code --list-extensions | grep ralph
```

You should see: `your-publisher-name.ralph-loop-agent`

This creates a `.vsix` file you can install or share.
