var path = require("path");
var filesys = require("fs");

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,// Seconds.
  "Content-Type": "application/json"
};

var storedData = JSON.parse(filesys.readFileSync('messages.txt'));

var sendResponse = function(response, statusCode, data) {
  response.writeHead(statusCode, defaultCorsHeaders);
  response.end(JSON.stringify(data));
}

var actions = {
  'GET': function(request, response) {
    var createdAt = request.url.split('?')[1];
    var getData = storedData;
    if (createdAt === 'order=-createdAt') {
      getData = storedData.slice().reverse();
    }
    sendResponse(response, 200, {results: getData});
  },
  'POST': function(request, response) {
    request.on('data', function(d) {
      var data = JSON.parse(d);
      data.createdAt = new Date().toISOString();
      storedData.push(data);
      filesys.writeFile('messages.txt', JSON.stringify(storedData));
    })
    sendResponse(response, 201, "hi");
  },
  'OPTIONS': function(request, response) {
    sendResponse(response, 200, null);
  }
}

module.exports = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  var full_path = path.join(process.cwd(),request.url.split('?')[0]);
  console.log(full_path);
  try {
    filesys.statSync(full_path);
  } catch (err) {
    sendResponse(response, 404, null);
  }

  var action = actions[request.method];
  if (action) {
    action(request, response);
  } else {
    sendResponse(response, 400, null);
  }
};
