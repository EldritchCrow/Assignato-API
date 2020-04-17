
var app = require('express')();
var use_http = require('http');
var use_https = require('https');
var http = use_http.Server(app);

var oauth = require("../lib/google_oauth.js");

const fs = require('fs');

const oAuth2Client = oauth.getOAuth2Client(JSON.parse(fs.readFileSync("../creds.json")));
const url = oauth.getAuthUrl(oAuth2Client);

console.log("Visit this address to authenticate the client");
console.log(url);

app.get("/main", function (req, res) {
    if (req.query.token == undefined) {
        use_https.get("https://localhost:8000/apiv1/decode_oauth?code=" + req.query.code, {rejectUnauthorized: false}, (resp) => {
            var data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                res.redirect("/main?token=" + JSON.parse(data).token);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            console.log(err);
        });
        return;
    }
    res.send(req.query);
})


http.listen(4200, function () {
    console.log('Server up on *:4200');
});