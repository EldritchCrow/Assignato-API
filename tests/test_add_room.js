

var use_http = require('http');
var fs = require('fs');

var post_body = JSON.stringify({
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

var token = fs.readFileSync("./token.txt");

var options = {
    hostname: "localhost",
    port: 3000,
    path: "/apiv1/add_room?token=" + token,
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': post_body.length
    }
}

const req = use_http.request(options, (resp) => {
    var data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        console.log(data);
        console.log(JSON.parse(data));
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
    console.log(err);
});

req.write(post_body);
req.end();