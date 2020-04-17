
var fs = require('fs');
const defaults = require("./default_responses.js");

function filterObj(obj, keys) {
    return Object.keys(obj)
        .filter(k => keys.includes(k))
        .reduce((o, k) => {
            o[k] = obj[k];
            return o;
        }, {});
}

var filters = {
    rooms: ["department", "building", "number", "capacity", "features"],
    professors: ["department", "name"],
    classes: ["professor_name", "size", "title", "section", "duration", "department", "crn", "requirements"],
    items: ["title", "duration", "requirements", "size", "range", "prefs"],
    constraints: ["type", "apply_to", "weight", "options", "artificial_key"],
    assignments: ["crn", "title", "building", "room", "start", "day"]
}

var mongo = require("mongodb").MongoClient;
const config = JSON.parse(fs.readFileSync("./config.json"));

async function genericAdd(user, collection, doc, res) {
    var cnx = await mongo.connect(config.mongo_url);
    var collec = await cnx.db(user.replace(".", ",")).collection(collection);
    var to_insert = filterObj(doc, filters[collection]);
    //TODO: implement editing by removing documents which share a virtual primary key in the schema
    var result = await collec.insertOne(to_insert);
    if (result.result.ok == 1) {
        res.send(defaults.post_success);
        return true;
    }
    res.send(defaults.post_failure);
    return false;
}

function getHexString(len) {
    const hex = '0123456789ABCDEF';
    var output = '';
    for (var i = 0; i < len; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}

async function getReportData(user, report_id, res) {
    console.log("Received request for report " + report_id);
    var cnx = await mongo.connect(config.mongo_url);
    var dbo = await cnx.db(user.replace(".", ","));
    var collections = await dbo.listCollections().toArray();
    if (!collections.map(x => x.name).includes(report_id)) {
        res.send({
            success: false,
            message: "Report is still generating"
        });
        return undefined;
    }
    var lkup = [
        {
            $lookup: {
                from: report_id,
                localField: "crn",
                foreignField: "crn",
                as: "row"
            }
        }
    ];
    var docs = (await dbo.collection("classes").aggregate(lkup).sort({ _id: 1 }).toArray()).map(x => Object({
        class: x.title,
        building: x.row[0].building,
        room: x.row[0].room,
        prof: x.professor_name,
        times: x.row.map(a => Object({
            day: a.day,
            start: a.start,
            end: a.end
        }))
    }));
    lkup = [
        {
            $lookup: {
                from: report_id,
                localField: "title",
                foreignField: "title",
                as: "row"
            }
        }
    ];
    docs = docs.concat((await dbo.collection("items").aggregate(lkup).sort({ _id: 1 }).toArray()).map(x => Object({
        item: x.title,
        building: x.row[0].building,
        room: x.row[0].room,
        times: x.row.map(a => Object({
            day: a.day,
            start: a.start,
            end: a.end
        }))
    })));
    return docs;
}

module.exports = {
    filterObj: filterObj,
    genericAdd: genericAdd,
    getHexString: getHexString,
    getReportData: getReportData
}