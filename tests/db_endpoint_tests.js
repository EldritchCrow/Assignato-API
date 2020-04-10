

var use_http = require('http');
var fs = require('fs');
var Promise = require('promise');

var token = fs.readFileSync("./token.txt");

var room_add = JSON.stringify({
    department: "DEPT",
    building: "BUILD",
    number: "NUM",
    capacity: 100,
    features: [
        "yes",
        "no",
        "maybe"
    ]
});

var prof_add = JSON.stringify({
    department: "DEPT",
    name: "Test Professor"
});

var class_add = JSON.stringify({
    professor_name: "Test Professor",
    size: 100,
    title: "Test course",
    section: 0,
    duration: 110,
    department: [
        "DEPT",
        "TEST"
    ],
    crn: 123456,
    requirements: [
        "req_1",
        "req_2"
    ]
});

var item_add = JSON.stringify({
    title: "Test item",
    duration: 60,
    requirements: [
        "req_1",
        "req_2"
    ],
    size: 30,
    range: {
        start: 1200,
        end: 1900
    },
    prefs: [
        {
            building: "Building name",
            number: "Room number"
        }
    ]
});

var constr_add = JSON.stringify({
    type: "building",
    apply_to: "all",
    weight: 0.9,
    options: {
        test_param: "hello",
        param2: "world"
    }
});

var constr_get = {
    type: "building"
}

var constr_rem = JSON.stringify({
    id: '4DA9FD845B71060E'
});

var assign = JSON.stringify({
    crn: 123456,
    building: "a building",
    room: "a room",
    day: "Monday",
    start: 1200,
    professor: "bob"
});

var remove = JSON.stringify({
    crn: 123456
});

var assign_rem = JSON.stringify({
    crn: 123456,
    building: "a building",
    room: "a room",
    day: "Monday",
    start: 1200
});

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

function getGETPath(route, args) {
    var arg_info = "?token=" + token;
    for(i in args) {
        arg_info += "&" + i + "=" + args[i];
    }
    return "http://localhost:3000/apiv1/" + route + arg_info;
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
                console.log(JSON.parse(data));
                resolve(data);
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
                console.log(JSON.parse(data));
                resolve(data);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            console.log(err);
            reject(err);
        });
    });
}

async function testPOST(route) {
    var data = {
        add_room: room_add,
        add_professor: prof_add,
        add_class: class_add,
        add_item: item_add,
        add_constraint: constr_add,
        remove_constraint: constr_rem,
        assign: assign,
        remove: remove,
        remove_assignment: assign_rem
    }[route];
    var opts = getPOSTOpts(route, data.length);
    await wrapPOSTRequest(opts, data, route);
}

async function testGET(route) {
    var data = {
        get_constraints: constr_get
    }[route];
    await wrapGETRequest(data, route);
}

async function main() {
    await testPOST("add_room");
    await testPOST("add_professor");
    await testPOST("add_class");
    await testPOST("add_item");
    await testPOST("add_constraint");
    await testGET("get_constraints");
    await testPOST("remove_constraint");
    await testPOST("assign");
    await testPOST("remove");
    await testPOST("remove_assignment");
}

main();