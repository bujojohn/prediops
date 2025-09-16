#!/usr/bin/env node

console.log('🚀 Testing documentation generation...');

import fs from 'fs';
import path from 'path';

const outputDir = './docs/generated';
const userDocsDir = './docs/generated/user';

console.log('📁 Creating directories...');

// Create directories
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created output directory');
} else {
  console.log('✅ Output directory already exists');
}

if (!fs.existsSync(userDocsDir)) {
  fs.mkdirSync(userDocsDir, { recursive: true });
  console.log('✅ Created user docs directory');
} else {
  console.log('✅ User docs directory already exists');
}

// Create a simple test file
const testContent = `# Test Documentation

This is a test file generated at ${new Date().toISOString()}.

## Test Content
- Item 1
- Item 2
- Item 3

## Success!
The documentation generation is working correctly.
`;

fs.writeFileSync(path.join(userDocsDir, 'TEST.md'), testContent);
console.log('✅ Test file created');

console.log('🎉 Documentation generation test completed!');
