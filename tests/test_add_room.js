

var use_http = require('http');

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

var options = {
    hostname: "localhost",
    port: 3000,
    path: "/apiv1/add_room?token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjI1N2Y2YTU4MjhkMWU0YTNhNmEwM2ZjZDFhMjQ2MWRiOTU5M2U2MjQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzOTU0MDA5NzQ3NjUtYmtsZDIzbG1hdWdnczI5OW9vOWRrOXJqZHRvMnBqOHQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzOTU0MDA5NzQ3NjUtYmtsZDIzbG1hdWdnczI5OW9vOWRrOXJqZHRvMnBqOHQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTAyNTczMTc0NTY4NzU3NTU2MTMiLCJlbWFpbCI6InNhbWNvaGVuMTIzNDU2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiTS12bEZ2X1pSLWlQeENlQ3NRd1JXUSIsIm5hbWUiOiJTYW0gQ29oZW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDQuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1faEVmM0xWZDZLSS9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBQS9BQUtXSkpOblpsQ0ZKeEZkUTNDdnc2a0ZHNXctVURkNkh3L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJTYW0iLCJmYW1pbHlfbmFtZSI6IkNvaGVuIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE1ODYzNjY2NjEsImV4cCI6MTU4NjM3MDI2MX0.fZjfhU0G61fICB9uAzitACprhZ9DSrmFiWaJF0UAODxL7TTJ3uwx4fRDw_G_HBmC3U1fqdCO1VNVZajBHdD6abKYWzOTuLNme8xjz_kDifLRhHBKCNjlEJwuIVzGtsOftfD7RawpCA_mV5W162k56e8-jGrZIgaRpaOniaZT88LbQGFPO9UmIscprMmxca-F88HkcE7HXHZ1S-07mhGDEujr4TXk8Zj_QPI1JxLq6u48pgcC_lQkHL7a8nWMly1lTfo1Ft1eYhS_kjcpiijzKKe1_tDg6lkBl3SwTJb4ed7OGez6BsgaQ336pBrGuMmLmIfmyL00WewAGnVMshhlhQ",
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