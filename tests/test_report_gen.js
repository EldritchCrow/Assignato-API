

var use_http = require('http');
var fs = require('fs');
var Promise = require('promise');

var token = fs.readFileSync("./token.txt");

var room_add = {
    department: "DEPT",
    building: "BUILD",
    number: "NUM",
    capacity: 100,
    features: [
        "yes",
        "no",
        "maybe"
    ]
};

var prof_add = {
    department: "DEPT",
    name: "Test Professor"
};

var classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => {
    return {
        professor_name: "Test Professor",
        size: 100,
        title: "Test course " + x,
        section: 0,
        duration: 110,
        department: [
            "DEPT",
            "TEST"
        ],
        crn: x,
        requirements: [
            "yes",
            "no"
        ]
    }
});

var items = [1, 2, 3, 4, 5, 6, 7, 8].map(x => {
    return {
        title: "Item " + x,
        duration: 60,
        requirements: [
            "maybe"
        ],
        size: 30
    }
});

var constr_add = {
    type: "time",
    apply_to: "all",
    weight: 0.4,
    options: {
        min_time: 1200,
        max_time: 1400
    }
};

var assign = {
    crn: 1,
    building: "BUILD",
    room: "NUM",
    day: "W",
    start: 1300
};

var gen_report = {
    types: [
        "basic"
    ]
};

function report_data(id, page) {
    return {
        id: id,
        page: page,
        per_page: 3
    }
}


function getGETPath(route, args) {
    var arg_info = "?token=" + token;
    for (i in args) {
        arg_info += "&" + i + "=" + args[i];
    }
    return "http://localhost:3000/apiv1/" + route + arg_info;
}

function wrapGETRequest(data, route) {
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

async function testGET(route, data) {
    return await wrapGETRequest(data, route);
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

async function timer(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve(true);
        }, ms);
    });
}

async function main() {
    await testPOST("reset", {});
    await testPOST("add_constraint", constr_add);
    await Promise.all(classes.map(async function (x) {
        await testPOST("add_class", x);
        return 1;
    }));
    await Promise.all(items.map(async function (x) {
        await testPOST("add_item", x);
        return 1;
    }));
    await testPOST("add_room", room_add);
    await testPOST("add_professor", prof_add);
    await testPOST("assign", assign);
    await testPOST("generate_reports", gen_report);
    var id = (await testPOST("generate_reports", gen_report)).data[0].id;
    await timer(500);
    await testGET("get_report_data", report_data(id, 1));
    var a = await testGET("get_report_data", report_data(id, 2));
    console.log("Sample time result");
    console.log(a.data[0]);
    await testGET("get_time_grid", {
        id: id,
        prof: "Test Professor"
    });
    await testGET("get_time_grid", {
        id: id,
        building: "BUILD",
        number: "NUM"
    });
}

main();