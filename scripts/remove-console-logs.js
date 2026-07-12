const fs = require('fs');
const path = require('path');

// Function to recursively get all .ts and .tsx files
function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      getAllTsFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to remove console logs from a file
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove console.log statements
    content = content.replace(/console\.log\([^;]*\);?\s*/g, '');
    // Remove console.info statements
    content = content.replace(/console\.info\([^;]*\);?\s*/g, '');
    // Remove console.warn statements
    content = content.replace(/console\.warn\([^;]*\);?\s*/g, '');
    // Remove console.debug statements
    content = content.replace(/console\.debug\([^;]*\);?\s*/g, '');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const tsFiles = getAllTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

tsFiles.forEach(removeConsoleLogs);

console.log('Console log cleanup complete!');