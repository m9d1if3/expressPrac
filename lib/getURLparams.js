const http = require('http');

exports.getURLparamsObj = function (port, request) {

   const urlObj = new URL(`https://localhost:${port}` + request.url);
   const urlParams = urlObj.searchParams;

   return urlParams;
}