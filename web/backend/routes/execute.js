const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

router.post('/', async (req, res) => {
  try {
    const { code, stdin = '' } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No C code provided' });
    }

    const tempDir = __dirname;
    const cFile = path.join(tempDir, 'temp.c');
    const exeFile = path.join(tempDir, 'temp.exe');

    // 1. Write C code to file
    fs.writeFileSync(cFile, code);

    // 2. Compile using GCC
    exec(`gcc "${cFile}" -o "${exeFile}"`, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        // Cleanup C file
        fs.unlinkSync(cFile);
        return res.json({
          output: '',
          stderr: "COMPILE ERROR:\n" + compileStderr,
          stdout: '',
          code: 1
        });
      }

      // 3. Execute the compiled program
      const process = spawn(exeFile);
      let runStdout = '';
      let runStderr = '';

      // Feed stdin if provided
      if (stdin) {
        // replace spaces with newlines if needed, or just write it
        process.stdin.write(stdin);
        process.stdin.end();
      }

      process.stdout.on('data', (data) => { runStdout += data.toString(); });
      process.stderr.on('data', (data) => { runStderr += data.toString(); });

      process.on('close', (exitCode) => {
        // Cleanup files
        try {
          fs.unlinkSync(cFile);
          fs.unlinkSync(exeFile);
        } catch(e) {}

        res.json({
          output: runStdout + runStderr,
          stderr: runStderr,
          stdout: runStdout,
          code: exitCode
        });
      });
    });

  } catch (error) {
    console.error('Error in local execution:', error.message);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

module.exports = router;
