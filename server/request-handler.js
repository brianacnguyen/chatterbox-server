var path = require("path");

var filesys = require("fs");

var storedData = []; 
exports.requestHandler = function(request, response) {

  var full_path = path.join(process.cwd(),request.url);

  try {
    filesys.statSync(full_path);
  } catch (err) {
    response.statusCode = 404;
    response.end();
    return response.finished;
  }

  console.log("Serving request type " + request.method + " for url " + request.url);

  if (request.method === 'GET' || request.method === 'OPTIONS') {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "application/json";
    response.writeHead(statusCode, headers);
    var obj = {results: storedData};
    response.end(JSON.stringify(obj));
  }
  else if (request.method === 'POST') {
    request.on('data', function(d) {
      storedData.push(JSON.parse(d));
    })
    response.writeHead(201, defaultCorsHeaders);
    response.end(JSON.stringify(201));
  }
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,// Seconds.
};

exports.handleRequest = function(request, response) {
  exports.requestHandler(request, response);
};
