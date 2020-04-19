
var Promise = require("promise");
const fs = require('fs');
const defaults = require("./default_responses.js");

function validateStrings(query, keys) {
    for (i in keys) {
        i = keys[i];
        if (typeof query[i] != "string") {
            return false;
        }
    }
    return validateKeyList({ k: keys }, ["k"]);
}

function validateNumeric(query, keys) {
    for (i in keys) {
        i = keys[i];
        if (query[i] !== parseInt(query[i], 10)) {
            return false;
        }
    }
    return true;
}

function validateKeyList(query, keys) {
    for (k in keys) {
        k = keys[k];
        if (query[k] == undefined)
            continue;
        for (i in query[k]) {
            if (i.charAt(0) == "$" || i.includes(".")) {
                return false;
            }
        }
    }
    return true;
}

var field_requirements = {
    string: {
        add_room: ["department", "building", "number"],
        add_professor: ["department", "name"],
        add_class: ["professor_name", "title"],
        add_item: ["title"],
        add_constraint: ["type", "apply_to"],
        assign: ["building", "room", "day"],
        remove_assignment: ["building", "room", "day"],
        get_report_data: ["id"],
        get_time_grid: ["id"],
        set_share_code: ["code"]
    },
    integer: {
        add_room: ["capacity"],
        add_class: ["size", "section", "duration", "crn"],
        add_item: ["duration", "size"],
        assign: ["start"],
        remove_assignment: ["start"],
        get_report_data: ["page", "per_page"]
    },
    keys: {
        add_room: ["features"],
        add_class: ["department", "features"],
        add_item: ["requirements"],
        generate_reports: ["types"]
    }
}

function getTokenData(token, requester_obj) {
    return new Promise(function (resolve, reject) {
        requester_obj.get("https://oauth2.googleapis.com/tokeninfo?access_token=" + token, resp => {
            var data = "";
            resp.on("data", chunk => {
                data += chunk;
            });
            resp.on("end", () => {
                resolve(JSON.parse(data));
            })
        });
    });
}

var mongo = require("mongodb").MongoClient;
const config = JSON.parse(fs.readFileSync("./config.json"));

async function validateOAuthToken(token, requester_obj) {
    return "testuser@gmail.com";
    var token_data = await getTokenData(token, requester_obj);
    if (token_data.error == undefined) {
        return token_data.email;
    }
    var cnx = await mongo.connect(config.mongo_url);
    // Find a valid entry for the given token
    var find_filter = {
        token: token,
        when: { $gt: + new Date() - 6 * 60 * 60 * 1000 }
    }
    var doc = await cnx.db("access_tokens").collection("cas_tokens").findOne(find_filter);
    if (doc != null) {
        return doc.user.replace("/", "");
    }
    return undefined;
}

async function precursorValidation(items, type, res, requester_obj, token) {
    var user = await validateOAuthToken(token, requester_obj);
    if (user == undefined) {
        res.send(defaults.auth_error);
        return undefined;
    }
    var flag = true;
    if (field_requirements.string[type] != undefined)
        flag &= validateStrings(items, field_requirements.string[type]);
    if (field_requirements.integer[type] != undefined)
        flag &= validateNumeric(items, field_requirements.integer[type]);
    if (field_requirements.keys[type] != undefined)
        flag &= validateKeyList(items, field_requirements.keys[type]);
    if (!flag) {
        res.send(defaults.validation_error);
        return undefined;
    }
    return user;
}

module.exports = {
    validationFuncs: {
        strings: validateStrings,
        numeric: validateNumeric,
        keyList: validateKeyList,
        oAuthToken: validateOAuthToken
    },
    precursorValidation: precursorValidation
}