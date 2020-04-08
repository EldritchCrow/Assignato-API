
var Promise = require("promise");


function validateStrings(query, keys) {
    keys.forEach(i => {
        if(typeof query[i] != String) {
            return false;
        }
    });
    return true;
}

function validateKeyList(keys) {
    keys.forEach(i => {
        if(i.charAt(0) == "$" || i.includes(".")) return false;
    });
    return true;
}

function getTokenData(token, requester_obj) {
    return new Promise(function(resolve, reject) {
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

module.exports = {
    validateStrings: validateStrings,
    validateKeyList: validateKeyList,
    validateOAuthToken: validateOAuthToken
}