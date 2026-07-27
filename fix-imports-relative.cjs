const fs = require('fs');
const path = require('path');
const uiDir = path.join(process.cwd(), 'src/components/ui');
const files = fs.readdirSync(uiDir);
const caseMap = {};
files.forEach(f => {
  const base = f.replace('.tsx', '').replace('.ts', '');
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
      
      const regex = /from\s+(['"])([^'"]+)(['"])/gi;
      
      content = content.replace(regex, (match, p1, p2, p3) => {
        if (!p2.startsWith('.')) return match;
        
        const parts = p2.split('/');
        const lastPart = parts[parts.length - 1];
        const lowerLast = lastPart.toLowerCase();
        
        if (caseMap[lowerLast] && caseMap[lowerLast] !== lastPart) {
           parts[parts.length - 1] = caseMap[lowerLast];
           changed = true;
           return 'from ' + p1 + parts.join('/') + p3;
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed relative imports in', fullPath);
      }
    }
  }
}
processDir(path.join(process.cwd(), 'src'));
console.log('Relative imports check Done!');
