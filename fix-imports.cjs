const fs = require('fs');
const path = require('path');
const uiDir = path.join(process.cwd(), 'src/components/ui');
const files = fs.readdirSync(uiDir);
const caseMap = {};
files.forEach(f => {
  const base = f.replace('.tsx', '');
  caseMap[base.toLowerCase()] = base;
});

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      const regex = /(['"])(.*?\/components\/ui\/)([^'"]+)(['"])/gi;
      content = content.replace(regex, (match, p1, p2, p3, p4) => {
        const lowerName = p3.toLowerCase();
        if (caseMap[lowerName] && caseMap[lowerName] !== p3) {
          changed = true;
          return p1 + p2 + caseMap[lowerName] + p4;
        }
        return match;
      });
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed imports in', fullPath);
      }
    }
  }
}
processDir(path.join(process.cwd(), 'src'));
console.log('Done!');
