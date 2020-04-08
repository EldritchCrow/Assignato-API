

const fs = require('fs');

var express = require("express");
var app = express();

var use_http = require('http');
var use_https = require('https');
var ssl_creds = {
    key: fs.readFileSync("./ssl/key.pem"),
    cert: fs.readFileSync("./ssl/cert.pem")
}

var http = use_http.createServer(app);
var https = use_https.createServer(ssl_creds, app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const oauth = require("./lib/google_oauth.js");
const defaults = require("./lib/default_responses.js");
var { validateStrings, validateKeyList, validateOAuthToken } = require("./lib/validation.js");

var mongo = require("mongodb").MongoClient;

const config = JSON.parse(fs.readFileSync("config.json"));

var assignato_lib = require("./lib/misc_lib.js");


app.get("/apiv1/get_login_link", function (req, res) {
    const oAuth2Client = oauth.getOAuth2Client(JSON.parse(fs.readFileSync("creds.json")));
    const url = oauth.getAuthUrl(oAuth2Client);
    res.send({
        url: url
    });
})

app.post("/apiv1/add_room", async function (req, res) {
    var user = await validateOAuthToken(req.query.token, use_https);
    if (user == undefined) {
        res.send(defaults.auth_error);
        return;
    }
    if (!validateStrings(req.body, ["department", "building", "number", "capacity"])
        || !validateKeyList(req.body.features)) {
        res.send(defaults.validation_error);
        return;
    }
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(user.replace(".", ",")).collection("rooms");
    var to_insert = assignato_lib.filterObj(req.body, ["department", "building", "number", "capacity", "features"]);
    //TODO: implement editing by removing documents which share a virtual primary key in the schema
    var result = await collec.insertOne(to_insert);
    if (result.result.ok == 1) {
        res.send(defaults.post_success);
        return;
    }
    res.send(defaults.post_failure);
});

app.get("/apiv1/add_professor", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/add_class", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/add_item", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/add_constraint", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/get_constraints", function (req, res) {
    res.send(defaults.default_constraints);
});
app.get("/apiv1/remove_constraint", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/assign", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/remove", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/remove_assignment", function (req, res) {
    res.send(defaults.default_post);
});
app.get("/apiv1/generate_reports", function (req, res) {
    res.send(defaults.default_report_gen);
});
app.get("/apiv1/get_report_data", function (req, res) {
    res.send(defaults.default_report_data);
});
app.get("/apiv1/get_time_grid", function (req, res) {
    res.send(defaults.default_timegrid_data);
});


https.listen(8000, function () {
    console.log('Server up on *:8000');
});
http.listen(3000, function () {
    console.log('Server up on *:3000');
});