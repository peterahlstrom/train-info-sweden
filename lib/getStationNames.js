var request = require('request');
var fs = require('fs');
var xmlReq = 'station_template.xml';
var cacheFile = 'cache/stations.json'
var url = 'http://api.trafikinfo.trafikverket.se/v1/data.json';
var config = JSON.parse(fs.readFileSync('config.json').toString())

function post(callback){
	var postReq = fs.readFileSync(xmlReq).toString().replace('{apikey}', config.api_key);
	request.post(
	    {
	    url:url,
	    body : postReq,
	    headers: {'Content-Type': 'text/xml'},
	    },
	    function (error, response, body) {
	    	if (error) {
	    		console.error(error);
	    		return;
	    	}
	        if (!error && response.statusCode == 200) {
	            callback(body);
	        }
	    }
	);
}

function parseData(body) {
	var stations = {};
	var data = JSON.parse(body.toString()).RESPONSE.RESULT[0].TrainStation;
	data.forEach(function(loc){
		stations[loc['LocationSignature']] = loc['AdvertisedLocationName'];
	});
	return stations;
}

module.exports = function(callback) {
	var now = new Date();
	var fileStat;
	var changeTime;

	if (!fs.existsSync(cacheFile)){
		console.log('Stations cachefile missing. Creating new file...')
		fs.writeFileSync(cacheFile, '{}');
	}
	fileStat = fs.statSync(cacheFile);
	changeTime = (fileStat.size > 10) ? fileStat.atime : new Date(1979,8,13);
	if (now - changeTime > 86400000 ){
		console.log('Fetching new station data...');
		post(function(body){
			var output = parseData(body);
			fs.writeFileSync(cacheFile, JSON.stringify(output));
			callback(JSON.stringify(output));
		});
	}
	else {
		callback(fs.readFileSync(cacheFile));
	}
	
}