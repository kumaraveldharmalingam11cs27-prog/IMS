const http = require('http');
const data = JSON.stringify({ username: 'admin', password: 'admin123' });
const opts = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('LOGIN', res.statusCode, body);
    if (res.statusCode === 200) {
      const token = JSON.parse(body).access_token;
      const opts2 = {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/dashboard/stats',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      };
      const req2 = http.request(opts2, (res2) => {
        let body2 = '';
        res2.on('data', (chunk) => body2 += chunk);
        res2.on('end', () => {
          console.log('STATS', res2.statusCode, body2);
          const req3 = http.request({
            hostname:'127.0.0.1',
            port:5000,
            path:'/api/orders',
            method:'GET',
            headers: {'Authorization': 'Bearer '+token},
          }, (res3)=>{
            let body3=''; res3.on('data',c=>body3+=c);res3.on('end',()=>console.log('ORDERS',res3.statusCode,body3));});
          req3.end();
        });
      });
      req2.end();
    }
  });
});
req.on('error', (e) => console.error('ERR', e));
req.write(data);
req.end();
