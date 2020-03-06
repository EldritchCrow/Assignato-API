
var app = require('express')();
var use_http = require('http');
var http = use_http.Server(app);

var oauth = require("../lib/google_oauth.js/index.js");

const fs = require('fs');

const oAuth2Client = oauth.getOAuth2Client(JSON.parse(fs.readFileSync("creds.json")));
const url = oauth.getAuthUrl(oAuth2Client);

console.log("Visit this address to authenticate the client");
console.log(url);

app.get("/main", function (req, res) {
    if(req.query.token == undefined) {
        oAuth2Client.getToken(req.query.code, (err, token) => {
            res.redirect("/main?token=" + token);
        })
    }
    res.send(req.query);
})


http.listen(4200, function () {
    console.log('Server up on *:4200');
});