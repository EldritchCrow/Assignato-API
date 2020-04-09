
var Promise = require("promise");

const defaults = require("./lib/default_responses.js");

function validateStrings(query, keys) {
    var flag = true;
    keys.forEach(i => {
        if (typeof query[i] != String) {
            flag = false;
        }
    });
    flag &= validateKeyList({k: keys}, ["k"]);
    return flag;
}

function validateNumeric(query, keys) {
    var flag = true;
    keys.forEach(i => {
        if (query[i] !== parseInt(query[i], 10)) {
            flag = false;
        }
    });
    return flag;
}

function validateKeyList(query, keys) {
    var flag = true;
    keys.forEach(k => {
        query[k].forEach(i => {
            if (i.charAt(0) == "$" || i.includes("."))
                flag = false;
        });
    });
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
        remove_assignment: ["building", "room", "day"]
    },
    integer: {
        add_room: ["capacity"],
        add_class: ["size", "section", "duration", "crn"],
        add_item: ["duration", "size"],
        assign: ["start"],
        remove_assignment: ["time"]
    },
    keys: {
        add_room: ["features"],
        add_class: ["department", "features"],
        add_item: ["requirements"]
    }
}

function getTokenData(token, requester_obj) {
    return new Promise(function (resolve, reject) {
        requester_obj.get("https://oauth2.googleapis.com/tokeninfo?id_token=" + token, resp => {
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

async function validateOAuthToken(token, requester_obj) {
    var token_data = await getTokenData(token, requester_obj);
    if (token_data.error == undefined) {
        return token_data.email;
    }
    return undefined;
}

async function precursorValidation(items, type, res, requester_obj) {
    var user = await validateOAuthToken(req.query.token, requester_obj);
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