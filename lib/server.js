var http = require('http');

module.exports = function(port, onRequest) {
	http.createServer(onRequest).listen(port);
	console.log('Server listening on port', port);
};