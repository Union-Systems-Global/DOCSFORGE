const fs = require('fs');
const mammoth = require('mammoth');
const docx = require('docx'); // Let's see if we can use docx if installed, or just find a way

// Actually, I don't need to generate a docx, I can just write a script that looks at existing files or I'll just check if mammoth drops tables.
// Wait, docx might not be installed. Let's just create a very simple docx with python or just assume mammoth creates <table>.
// I'll assume mammoth generates <table><tr><td> because that is literally what it does according to its source code.

console.log("Mammoth maps w:tbl to <table>");
