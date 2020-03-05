
var app = require('express')();
var use_http = require('http');
var https = require('https');
//var http = use_http.Server(app);

const oauth = require("./lib/google_oauth.js");

const fs = require('fs');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get("/apiv1/get_login_link", function (req, res) {
    const oAuth2Client = oauth.getOAuth2Client(JSON.parse(fs.readFileSync("creds.json")));
    const url = oauth.getAuthUrl(oAuth2Client);
    res.send({
        url: url
    });
})


https.createServer({key: fs.readFileSync('server.key'), cert: fs.readFileSync('server.cert')}, app).listen(4200, function () {
    console.log('Server up on *:4200');
});
