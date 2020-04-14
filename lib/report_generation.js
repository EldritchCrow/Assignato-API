
var lib = require("./misc_lib.js");
var constr_lib = require("./constraint_lib.js");

const fs = require('fs');
const config = JSON.parse(fs.readFileSync("config.json"));

var mongo = require("mongodb").MongoClient;

function generateReport(userid, type) {
    var new_key = lib.getHexString(16);
    switch (type) {
        case "basic":
            createBasicReport(userid, new_key);
            break;
        default:
            break;
    }
    return new_key;
}

var days = ["M", "T", "W", "R", "F"];

async function createBasicReport(userid, key) {
    var cnx = await mongo.connect(config.mongo_url);
    var dbo = await cnx.db(userid.replace(".", ","));
    var classes = await dbo.collection("classes").find({}).toArray();
    var rooms = await dbo.collection("rooms").find({}).toArray();
    var items = await dbo.collection("items").find({}).toArray();
    var assignments = await dbo.collection("assignments").find({}).toArray();
    assignments = assignments.map(a => {
        var duration;
        if(a.crn != undefined) {
            duration = classes.filter(x => x.crn == a.crn)[0].duration;
        } else {
            duration = items.filter(x => x.title == a.title)[0].duration;
        }
        a.end = a.start + Math.floor(duration / 60) * 100;
        a.end += duration % 60;
        return a;
    })
    var constraints = await dbo.collection("constraints").find({}).toArray();
    constraints = constraints.map(x => constr_lib.docToObject(x));
    var possible = getAllClassAssigns(classes, rooms);
    assignments = doBasicAlgorithm(classes, possible, assignments, constraints, (a, b) => a.crn == b.crn);
    var possible = getAllItemAssigns(items, rooms);
    assignments = doBasicAlgorithm(items, possible, assignments, constraints, (a, b) => a.title == b.title);
    saveReport(userid, key, assignments);
}

function doBasicAlgorithm(itr, possible, assignments, constraints, identCheck) {
    while (itr.length > 0) {
        possible = possible.filter(x => assignIsPossible(x, assignments));
        if (possible.length == 0) {
            console.log("ERROR: No solution possible");
            return assignments;
        }
        weights = possible.map(x => {
            return constraints.map(c => c.evaluate(x)).reduce((a, b) => a + b, 0);
        });
        var best = possible[weights.reduce((i_min, x, i, arr) => x < arr[i_min] ? i : i_min, 0)];
        assignments.push(best);
        itr = itr.filter(x => !identCheck(x, best));
        possible = possible.filter(x => !identCheck(x, best));
    }
    return assignments;
}

function timeOverlap(a, b) {
    return (b.start < a.end && b.start >= a.start) || (a.start < b.end && a.start >= b.start)
}

function assignIsPossible(assign, assignments) {
    return assignments.every(a => {
        if (assign.building == a.building && assign.room == a.room && assign.day == a.day
            && timeOverlap(assign, a))
            return false;
        return true;
    });
}

function getAllClassAssigns(classes, rooms) {
    var ret = []
    classes.forEach(c => {
        rooms.forEach(r => {
            if (r.capacity < c.size)
                return;
            if (!c.requirements.every(x => r.features.includes(x)))
                return;
            days.forEach(d => {
                for (var t = 900; t <= 1600; t += 100) {
                    ret.push({
                        crn: c.crn,
                        building: r.building,
                        room: r.number,
                        day: d,
                        start: t,
                        end: t + Math.floor(c.duration / 60) * 100 + (c.duration % 60)
                    });
                }
            })
        });
    });
    return ret;
}
function getAllItemAssigns(items, rooms) {
    var ret = []
    items.forEach(c => {
        rooms.forEach(r => {
            if (r.capacity < c.size)
                return;
            if (!c.requirements.every(x => r.features.includes(x)))
                return;
            days.forEach(d => {
                for (var t = 900; t <= 1600; t += 100) {
                    ret.push({
                        title: c.title,
                        building: r.building,
                        room: r.number,
                        day: d,
                        start: t,
                        end: t + c.duration
                    });
                }
            })
        });
    });
    return ret;
}

async function saveReport(userid, key, assignments) {
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(userid.replace(".", ",")).collection(key);
    var res = await collec.insertMany(assignments);
    console.log("Wrote " + res.result.n + " of " + assignments.length + " documents for user " + userid + " with report ID " + key);
    collec = await cnx.db(userid.replace(".", ",")).collection("reports");
    collec.findOneAndUpdate({artificial_key: key}, {$set: {status: "Unseen"}});
}

module.exports = {
    generateReport: generateReport
}