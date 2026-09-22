const http = require('http');

const payload = JSON.stringify({
  title: 'Test large doc',
  content: 'A'.repeat(1 * 1024 * 1024) // 1MB string
});

const req = http.request('http://localhost:3132/api/documents/test_id', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(payload);
req.end();
