const http = require('http');

const data = JSON.stringify({
  message: "Hello Loopy! How do I center a div?",
  history: []
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/loopy',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
