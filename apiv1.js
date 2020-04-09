

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
var { precursorValidation, validationFuncs } = require("./lib/validation.js");

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
    var user = await precursorValidation(req.body, "add_room", res, use_https);
    if (user == undefined)
        return;
    await assignato_lib.genericAdd(user, "rooms", req.body, res);
});

app.post("/apiv1/add_professor", async function (req, res) {
    var user = await precursorValidation(req.body, "add_professor", res, use_https);
    if (user == undefined)
        return;
    await assignato_lib.genericAdd(user, "professors", req.body, res);
});

app.post("/apiv1/add_class", async function (req, res) {
    var user = await precursorValidation(req.body, "add_class", res, use_https);
    if (user == undefined)
        return;
    await assignato_lib.genericAdd(user, "classes", req.body, res);
});

app.post("/apiv1/add_item", async function (req, res) {
    var user = await precursorValidation(req.body, "add_item", res, use_https);
    if (user == undefined)
        return;
    //Secondary validation for unique structures to add_item
    var flag = validationFuncs.numeric(req.body.range, ['start', 'end']);
    req.body.prefs.forEach(x => {
        flag &= validationFuncs.strings(x, ["building", "number"]);
    });
    if (!flag) {
        res.send(defaults.validation_error);
        return;
    }
    await assignato_lib.genericAdd(user, "items", req.body, res);
});

app.post("/apiv1/add_constraint", async function (req, res) {
    var user = await precursorValidation(req.body, "add_constraint", res, use_https);
    if (user == undefined)
        return;
    //Secondary validation for unique structures to add_constraint
    var flag = req.body.weight === parseFloat(req.body.weight);
    for (const x in req.body.options) {
        flag &= x.charAt(0) != "$" && !x.includes(".");
        const y = req.body.options[x];
        if (typeof y == String)
            flag &= y.charAt(0) != "$" && !y.includes(".");
    }
    if (!flag) {
        res.send(defaults.validation_error);
        return;
    }
    var to_insert = req.body;
    to_insert.artificial_key = assignato_lib.getHexString(16);
    await assignato_lib.genericAdd(user, "constraints", to_insert, res);
});

app.get("/apiv1/get_constraints", async function (req, res) {
    var user = await validationFuncs.oAuthToken(req.query.token, use_https);
    if (user == undefined)
        return;
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(user.replace(".", ",")).collection("constraints");
    var query = {}
    if (validationFuncs.numeric(req.query, ["crn"]))
        query.apply_to = req.query.crn;
    else if (validationFuncs.strings(req.query, ["title"]))
        query.apply_to = req.query.title;
    else if (validationFuncs.strings(req.query, ["name"]))
        query.apply_to = req.query.name;
    if (validationFuncs.strings(req.query, ["type"]))
        query.type = req.query.type;
    var results = await collec.find(query, { _id: 0, options: 0 }).toArray();
    results = results.map(x => {
        x.id = x.artificial_key;
        delete x.artificial_key;
        return x;
    });
    res.send({
        constraints: x
    });
});

app.post("/apiv1/remove_constraint", async function (req, res) {
    var user = await validationFuncs.oAuthToken(req.query.token, use_https);
    if (user == undefined)
        return;
    if (validationFuncs.strings(req.body, ["id"])) {
        res.send(defaults.validation_error);
        return;
    }
    var filter = {};
    filter.artificial_key = req.body.id;
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(user.replace(".", ",")).collection("constraints");
    var result = await collec.deleteOne(query);
    if (result.result.ok == 1) {
        res.send(defaults.post_success);
        return;
    }
    res.send(defaults.post_failure);
});

app.post("/apiv1/assign", async function (req, res) {
    var user = await precursorValidation(req.body, "assign", res, use_https);
    if (user == undefined)
        return;
    if ((req.body.crn == undefined && req.body.title == undefined)
        || (!validationFuncs.numeric(req.body, ["crn"]) && !validationFuncs.strings(req.body, ["title"]))
        || (req.body.professor != undefined && !validationFuncs.strings(req.body, ["professor"]))) {
        res.send(defaults.validation_error);
        return;
    }
    await assignato_lib.genericAdd(user, "assignments", req.body, res);
});

app.post("/apiv1/remove_assignment", async function (req, res) {
    var user = await precursorValidation(req.body, "remove_assignment", res, use_https);
    if (user == undefined)
        return;
    if ((req.body.crn == undefined && req.body.title == undefined)
        || (!validationFuncs.numeric(req.body, ["crn"]) && !validationFuncs.strings(req.body, ["title"]))) {
        res.send(defaults.validation_error);
        return;
    }
    var filter = assignato_lib.filterObj(req.body, ["crn", "title", "building", "room", "start", "professor"]);
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(user.replace(".", ",")).collection("assignments");
    var result = await collec.deleteOne(filter);
    if (result.result.ok == 1) {
        res.send(defaults.post_success);
        return;
    }
    res.send(defaults.deletion_error);
});

app.post("/apiv1/remove", async function (req, res) {
    var user = await validationFuncs.oAuthToken(req.query.token, use_https);
    if (user == undefined)
        return;
    var idx = ["crn", "title", "name"].filter(x => Object.keys(req.body).includes(x));
    if (idx.length != 1
        || (idx[0] == "crn" && !validationFuncs.numeric(req.body, ["crn"]))
        || (idx[0] == "title" && !validationFuncs.strings(req.body, ["title"]))
        || (idx[0] == "name" && !validationFuncs.strings(req.body, ["name"]))) {
        res.send(defaults.validation_error);
        return;
    }
    var collec_name = {
        crn: "classes",
        title: "items",
        name: "professors"
    }[idx[0]];
    var filter = {};
    filter[idx[0]] = req.body[idx[0]];
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(user.replace(".", ",")).collection(collec_name);
    var result = await collec.deleteOne(filter);
    if (result.result.ok == 1) {
        res.send(defaults.post_success);
        return;
    }
    res.send(defaults.deletion_error);
});

app.post("/apiv1/generate_reports", async function (req, res) {
    res.send(defaults.default_report_gen);
});

app.get("/apiv1/get_report_data", async function (req, res) {
    res.send(defaults.default_report_data);
});

app.get("/apiv1/get_time_grid", async function (req, res) {
    res.send(defaults.default_timegrid_data);
});


https.listen(8000, function () {
    console.log('HTTPS server up on *:8000');
});
http.listen(3000, function () {
    console.log('HTTP server up on *:3000');
});