
var app = require('express')();
var use_http = require('http');
var http = use_http.Server(app);


const oauth = require("./lib/google_oauth.js");


app.get("/apiv1/get_login_link", function (req, res) {
    const oAuth2Client = oauth.getOAuth2Client(JSON.parse(fs.readFileSync("creds.json")));
    const url = oauth.getAuthUrl(oAuth2Client);
    res.send({
        url: url
    });
})


http.listen(4200, function () {
    console.log('Server up on *:4200');
});