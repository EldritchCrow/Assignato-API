
var app = require('express')();
var use_http = require('http');
var http = use_http.Server(app);

const oauth = require("./lib/google_oauth.js");
const defaults = require("./lib/dummy_responses.js");

const fs = require('fs');


app.get("/apiv1/get_login_link", function (req, res) {
    const oAuth2Client = oauth.getOAuth2Client(JSON.parse(fs.readFileSync("creds.json")));
    const url = oauth.getAuthUrl(oAuth2Client);
    res.send({
        url: url
    });
})

app.get("/apiv1/add_room", function (req, res) {
    res.send(defaults.default_post);
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


http.listen(4200, function () {
    console.log('Server up on *:4200');
});