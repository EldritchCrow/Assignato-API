
var app = require('express')();
var https = require('https');

const oauth = require("./lib/google_oauth.js");

const fs = require('fs');

const { key, cert, CA } = JSON.parse(fs.readFileSync("httpsCertificates.json"));
const privateKey = fs.readFileSync(key, 'utf8');
const certificate = fs.readFileSync(cert, 'utf8');
const ca = fs.readFileSync(CA, 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

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
});


https.createServer(credentials, app).listen(4200, function () {
    console.log('Server up on *:4200');
});

