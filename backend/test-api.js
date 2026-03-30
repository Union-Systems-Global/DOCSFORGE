const pdf = require('pdf-parse');
console.log('KEYS:', Object.keys(pdf));

async function test() {
  try {
    if (typeof pdf.PDFParse === 'function') {
      console.log('PDFParse is a function/constructor');
      // Let's see if it has a static parse method
      if (typeof pdf.PDFParse.parse === 'function') {
        console.log('Found static PDFParse.parse');
      }
    }
    
    // Check if there is a 'default' property that is a function (classic style)
    if (typeof pdf.default === 'function') {
       console.log('Found .default function');
    }

  } catch (e) {
    console.error('Test failed:', e);
  }
}

test();
