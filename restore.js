const fs = require('fs');
const transcriptPath = 'C:\\Users\\KRITIKA SHARMA\\.gemini\\antigravity-ide\\brain\\87bccffb-9904-4ebe-b0b4-8f8fefcfdca1\\.system_generated\\logs\\transcript.jsonl';

try {
  const contentStr = fs.readFileSync(transcriptPath, 'utf8');
  const lines = contentStr.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      for (const tc of obj.tool_calls || []) {
        if (tc.name === 'write_to_file' && tc.args.TargetFile.toLowerCase().includes('weathercalendar')) {
          const code = tc.args.CodeContent;
          console.log('code type:', typeof code);
          console.log('code starts with:', JSON.stringify(code.slice(0, 30)));
          console.log('code ends with:', JSON.stringify(code.slice(-30)));
          process.exit(0);
        }
      }
    } catch (e) {
      // Ignore
    }
  }
} catch (err) {
  console.error(err);
}
