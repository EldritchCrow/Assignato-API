
var use_http = require('http');
var fs = require('fs');
var Promise = require('promise');

var token = fs.readFileSync("./token.txt");

function getGETPath(route, args) {
    var arg_info = "?token=" + token;
    for (i in args) {
        arg_info += "&" + i + "=" + args[i];
    }
    return "http://localhost:3000/apiv1/" + route + arg_info;
}

function testGET(route, data) {
    return new Promise(function (resolve, reject) {
        use_http.get(getGETPath(route, data), (resp) => {
            var data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                console.log("Response from: " + route);
                if (data.charAt(0) == "<")
                    console.log(data);
                console.log(JSON.parse(data));
                resolve(JSON.parse(data));
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            console.log(err);
            reject(err);
        });
    });
}

function getPOSTOpts(route, len) {
    return {
        hostname: "localhost",
        port: 3000,
        path: "/apiv1/" + route + "?token=" + token,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': len
        }
    }
}

function wrapPOSTRequest(options, data, route) {
    return new Promise(function (resolve, reject) {
        const req = use_http.request(options, (resp) => {
            var data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                console.log("Response from: " + route);
                if (data.charAt(0) == "<")
                    console.log(data);
                console.log(JSON.parse(data));
                resolve(JSON.parse(data));
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            console.log(err);
            reject(err);
        });
        req.write(data);
        req.end();
    });
}

async function testPOST(route, data) {
    data = JSON.stringify(data);
    var opts = getPOSTOpts(route, data.length);
    return await wrapPOSTRequest(opts, data, route);
}

async function main() {
    await testPOST("reset", {});
    var code = (await testGET("get_share_code", {})).code;
    if(code != (await testGET("get_share_code", {})).code)
        code = undefined.a;
    await testPOST("set_share_code", {code: code});
    await testPOST("reset_share_code", {});
    if(code == (await testGET("get_share_code", {})).code)
        code = undefined.a;
}

main();