const http = require('http');
const data = JSON.stringify({
  fullName: 'Test User',
  email: 'testuser@example.com',
  mobile: '9999999999',
  address: '123 Test Lane',
  city: 'TestCity',
  state: 'TestState',
  zipCode: '123456',
  membershipPlan: 'free'
});
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/members',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(body);
  });
});
req.on('error', console.error);
req.write(data);
req.end();
