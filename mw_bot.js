require('dotenv').config();
var HTMLParser = require('node-html-parser');
const https = require('https');
const Mastodon = require('mastodon-api');
// const fs = require('fs');

console.log("Mastodon Bot starting...");

const M = new Mastodon({
  client_key: process.env['CLIENT_KEY'],
  client_secret: process.env['CLIENT_SECRET'],
  access_token: process.env['ACCESS_TOKEN'],
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  api_url: 'https://m.quaoar.xyz/api/v1/'
});

const web = 'https://www.merriam-webster.com/word-of-the-day';

toot();
setInterval(toot, 24 * 60 * 60 * 1000);

function toot() {
  var params = {
    spoiler_text: 'Word of the day: ',
    status: '',
  }

  https.get(web, res => {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var root = HTMLParser.parse(body);
      params.spoiler_text += root.querySelectorAll("h1")[0].childNodes[0]._rawText;
      // console.log(params.spoiler_text);
      params.status += 'Class: ';
      params.status += root.querySelectorAll(".main-attr")[0].childNodes[0]._rawText + " | ";
      // console.log(root.querySelectorAll(".word-syllables")[0].childNodes[0]._rawText);
      params.status += 'Syllables: ' + root.querySelectorAll(".word-syllables")[0].childNodes[0]._rawText + "\n\n";
      // console.log(params.status);
      params.status += 'Definition: ';

      var ps = root.querySelectorAll(".wod-definition-container")[0].querySelectorAll("p");
      // console.log(ps[0].toString());

      for (var i in ps) {
        const p_ = ps[i].toString().replace(/(\<\/?[a-z]+\>)/g, '');
        const raw_p = p_.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/g, '');
        if (i == 0) {
          // console.log(raw_p);
          params.status += raw_p + '\n\n' + 'Example(s): \n';
        }
        else if (raw_p.startsWith('/')) {
          params.status += raw_p + '\n';
        }
      }

      M.post('statuses', params, (error, data) => {
        if (error) {
          console.error(error);
        } else {
          //fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
          //console.log(data);
          console.log(`ID: ${data.id} and timestamp: ${data.created_at}`);
          console.log(data.content);
        }
      });

      // console.log(params.status);

    });
  }).on('error', err => {
    console.log('Error: ', err.message);
  });

}
