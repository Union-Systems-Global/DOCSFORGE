const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function testWordParse() {
  const dummyPath = path.join(__dirname, 'test.docx');
  // We don't have a real docx, so we expect an error if it doesn't exist,
  // but we want to see if the module loads and the method exists.
  try {
    console.log('Testing mammoth module...');
    const result = await mammoth.convertToHtml({ path: 'non-existent.docx' });
    console.log('Result:', result.value);
  } catch (err) {
    console.log('Mammoth test expected error (file not found):', err.message);
  }
}

testWordParse();
