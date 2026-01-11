#!/usr/bin/env node

/**
 * Standalone Ralph Loop Test
 * Demonstrates the core Ralph Loop concept without VS Code
 */

const fs = require('fs');
const path = require('path');

class RalphLoopSimulator {
  constructor() {
    this.stateDir = path.join(__dirname, '.ralph-test');
    this.stateFile = path.join(this.stateDir, 'state.json');
  }

  startLoop(prompt, options = {}) {
    const state = {
      active: true,
      iteration: 1,
      maxIterations: options.maxIterations || 0,
      completionPromise: options.completionPromise || null,
      startedAt: new Date().toISOString(),
      prompt: prompt,
      workLog: []
    };

    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }

    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));

    console.log('🔄 Ralph Loop Started!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Prompt: ${prompt}`);
    console.log(`Max Iterations: ${state.maxIterations || '∞'}`);
    console.log(`Completion Promise: ${state.completionPromise || 'none'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return state;
  }

  getState() {
    if (!fs.existsSync(this.stateFile)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
  }

  logWork(iteration, work) {
    const state = this.getState();
    if (state) {
      state.workLog.push({
        iteration,
        timestamp: new Date().toISOString(),
        work
      });
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    }
  }

  shouldContinue(response) {
    const state = this.getState();
    if (!state) return { continue: false, reason: 'No active loop' };

    // Check completion promise
    if (state.completionPromise) {
      const regex = new RegExp(`<promise>\\s*${state.completionPromise}\\s*</promise>`, 'i');
      if (regex.test(response)) {
        return { continue: false, reason: 'Completion promise detected' };
      }
    }

    // Check max iterations
    if (state.maxIterations > 0 && state.iteration >= state.maxIterations) {
      return { continue: false, reason: 'Max iterations reached' };
    }

    return { continue: true, reason: 'Loop continues' };
  }

  incrementIteration() {
    const state = this.getState();
    if (state) {
      state.iteration++;
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
      return state.iteration;
    }
    return 0;
  }

  cancelLoop() {
    const state = this.getState();
    if (fs.existsSync(this.stateFile)) {
      fs.unlinkSync(this.stateFile);
    }
    if (fs.existsSync(this.stateDir)) {
      fs.rmdirSync(this.stateDir);
    }
    return state;
  }

  showStatus() {
    const state = this.getState();
    if (!state) {
      console.log('❌ No active Ralph loop');
      return;
    }

    console.log('\n📊 Ralph Loop Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Status: ${state.active ? '🟢 Active' : '⚫ Inactive'}`);
    console.log(`Iteration: ${state.iteration}${state.maxIterations > 0 ? ` / ${state.maxIterations}` : ''}`);
    console.log(`Started: ${new Date(state.startedAt).toLocaleString()}`);
    console.log(`Prompt: ${state.prompt}`);
    console.log(`Completion Promise: ${state.completionPromise || 'none'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (state.workLog.length > 0) {
      console.log('Work Log:');
      state.workLog.forEach(entry => {
        console.log(`  [${entry.iteration}] ${entry.work}`);
      });
      console.log();
    }
  }
}

// Simulate a Ralph Loop iteration
function simulateIteration(ralph, iteration, prompt) {
  console.log(`\n🔄 Iteration ${iteration}`);
  console.log('─'.repeat(50));
  console.log(`Prompt: ${prompt}\n`);

  // Simulate some work being done
  const work = `Working on: ${prompt}`;
  console.log(`💡 ${work}`);

  // Simulate file changes
  console.log('📝 Modified files: example.ts, test.ts');

  // Log the work
  ralph.logWork(iteration, work);

  // Simulate a response
  let response = `Completed work for iteration ${iteration}`;
  
  // On the last iteration, output the promise
  if (iteration === 3) {
    response += '\n<promise>TASK COMPLETE</promise>';
    console.log('\n✅ Task completed! Outputting promise...');
  }

  return response;
}

// Run the test
function runTest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Ralph Loop Agent - Standalone Test');
  console.log('═══════════════════════════════════════════════════════\n');

  const ralph = new RalphLoopSimulator();

  // Test 1: Start a loop with completion promise
  console.log('TEST 1: Starting Ralph Loop with completion promise\n');
  ralph.startLoop('Add unit tests to the auth module', {
    maxIterations: 5,
    completionPromise: 'TASK COMPLETE'
  });

  // Simulate 3 iterations
  for (let i = 1; i <= 3; i++) {
    const state = ralph.getState();
    const response = simulateIteration(ralph, i, state.prompt);
    
    const { continue: shouldContinue, reason } = ralph.shouldContinue(response);
    
    if (!shouldContinue) {
      console.log(`\n🎉 Loop completed: ${reason}`);
      break;
    } else {
      ralph.incrementIteration();
      console.log(`\n➡️  Continuing to iteration ${i + 1}...`);
    }
  }

  // Show final status
  ralph.showStatus();

  // Clean up
  console.log('\n🧹 Cleaning up test state...');
  const finalState = ralph.cancelLoop();
  console.log(`✅ Loop ran for ${finalState.iteration} iterations\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test Complete!');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Key Concepts Demonstrated:');
  console.log('  ✓ Same prompt repeated each iteration');
  console.log('  ✓ Work persists and builds on previous iterations');
  console.log('  ✓ Completion promise detection');
  console.log('  ✓ Iteration counting and limits');
  console.log('  ✓ State management\n');

  console.log('To use in VS Code:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Compile: npm run compile');
  console.log('  3. Press F5 to launch extension');
  console.log('  4. Use: @ralph /loop <your prompt>\n');
}

// Run if executed directly
if (require.main === module) {
  runTest();
}

module.exports = { RalphLoopSimulator };
