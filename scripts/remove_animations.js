// scripts/remove_animations.js
const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, ext, fileList);
    } else if (fullPath.endsWith(ext)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove Tailwind animation and stagger classes
  content = content.replace(/\b(?:animate-[^\s"'`]+|stagger-\d+)\b/g, '');
  // Collapse multiple spaces in className strings
  content = content.replace(/className=\"([^"]*)\"/g, (match, p1) => {
    const cleaned = p1.replace(/\s+/g, ' ').trim();
    return `className=\"${cleaned}\"`;
  });
  // Adjust input padding pl-10 to pl-12 for inputs with input-dark
  content = content.replace(/className=\"([^\"]*input-dark[^\"]*)\"/g, (match, p1) => {
    const newClass = p1.replace(/pl-10\b/g, 'pl-12');
    return `className=\"${newClass}\"`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', filePath);
}

const projectRoot = path.resolve(__dirname, '..');
const tsxFiles = getAllFiles(projectRoot, '.tsx');
tsxFiles.forEach(processFile);
