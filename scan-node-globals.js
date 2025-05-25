const fs = require('fs');
const path = require('path');

const patterns = [
  { name: 'module.exports', regex: /\bmodule\.exports\b/ },
  { name: 'require(',       regex: /\brequire\(/ },
  { name: 'exports.',       regex: /\bexports\./ }
];

function scanDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        scanDir(fullPath);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        patterns.forEach(p => {
          if (p.regex.test(line)) {
            console.log(`${p.name} → ${fullPath}:${idx+1} → ${line.trim()}`);
          }
        });
      });
    }
  });
}

scanDir(process.cwd());
