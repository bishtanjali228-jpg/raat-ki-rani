const https = require('https');

const handler = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { phone, otp, apikey } = JSON.parse(body);
      if (!phone || !otp || !apikey) {
        res.writeHead(400); res.end(JSON.stringify({error:'Missing params'})); return;
      }
      const path = `/dev/bulkV2?authorization=${encodeURIComponent(apikey)}&route=otp&numbers=${phone}&variables_values=${otp}&flash=0`;
      const options = { hostname:'www.fast2sms.com', path, method:'GET', headers:{'authorization':apikey} };
      const preq = https.request(options, pres => {
        let data = '';
        pres.on('data', c => data += c);
        pres.on('end', () => { res.writeHead(200,{'Content-Type':'application/json'}); res.end(data); });
      });
      preq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({error:e.message})); });
      preq.end();
    } catch(e) { res.writeHead(500); res.end(JSON.stringify({error:e.message})); }
  });
};

const port = process.env.PORT || 3000;
require('http').createServer(handler).listen(port, () => console.log('OTP proxy running on', port));
