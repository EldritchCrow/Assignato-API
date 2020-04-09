
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
    constraints: ["type", "apply_to", "weight", "options"],
    assignments: ["crn", "title", "building", "room", "start", "professor"]
}

var mongo = require("mongodb").MongoClient;
const config = JSON.parse(fs.readFileSync("config.json"));

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

module.exports = {
    filterObj: filterObj,
    genericAdd: genericAdd,
    getHexString: getHexString
}