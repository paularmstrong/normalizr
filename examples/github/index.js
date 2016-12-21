import * as schema from './schema';
import https from 'https';
import { normalize } from '../../src';

let data = '';
const request = https.request({
  host: 'api.github.com',
  path: '/repos/paularmstrong/normalizr/issues',
  method: 'get',
  headers: {
    'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
  }
}, (res) => {
  res.on('data', (d) => {
    data += d;
  });

  res.on('end', () => {
    console.log(normalize(JSON.parse(data), [ schema.issue ]));
  });

  res.on('error', (e) => {
    console.log(e);
  });
});

request.end();
