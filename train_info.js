var http = require('http');
var request = require('request');
var fs = require('fs');
var cachedRequest = require('cached-request')(request);
var cacheDirectory = 'cache/';
var server = require('./lib/server');
var url = 'http://api.trafikinfo.trafikverket.se/v1/data.json';
var xmlReq = 'req_template.xml';
var config = JSON.parse(fs.readFileSync('config.json').toString())
var trainId;
var getStationNames = require('./lib/getStationNames');
var stationNames;
var timeUpdated = new Date();
cachedRequest.setCacheDirectory(cacheDirectory);

function readReq(trainId){
	return  fs.readFileSync(xmlReq).toString()
				.replace('{trainId}', trainId)
				.replace('{apikey}', config.api_key);
}

function post(trainId, callback, res){
	var xmlReq = readReq(trainId.toString());
	var start = Date.now();
	cachedRequest(
	    {
	    method: 'POST',
	    url:url,
	    body : xmlReq,
	    headers: {'Content-Type': 'text/xml'},
	    ttl: 1200
	    },
	    function (error, response, body) {
	    	if (error) {
	    		console.error(error);
	    		return;
	    	}
	        if (!error && response.statusCode == 200) {
	            lastUpdated = new Date().toLocaleTimeString();
	            stop = Date.now()
	            processTime = (stop - start) / 1000;
	            body = JSON.parse(body)
	            body.processTime = processTime;
	            body.lastUpdated = lastUpdated;
	            callback(body, res);
	        }
	    }
	);
}

function prepareData(data, res) {
	// merge data into new object
	//data = JSON.parse(data);
	var stops = [],
		tempStops = [],
		l = {};
	if (!data.RESPONSE.RESULT[0].TrainAnnouncement) {
		res.end('No train with this number');
		console.log('No train with this number');
		return;
	}
	var processTime = data.processTime;
	var data = data.RESPONSE.RESULT[0].TrainAnnouncement;

	data.forEach(function(loc){
		if (tempStops.indexOf(loc.LocationSignature) === -1){
			l = {};
			l[loc.LocationSignature] = {'Ankomst': {}, 'Avgang': {}};
			tempStops.push(loc.LocationSignature);
			stops.push(l);
		}

		try {
		l[loc.LocationSignature][loc.ActivityType] = loc;
		}
		catch(err) {
			 console.error(err);
			return;
		}
	});
	displayData(stops, res, processTime);
}

function displayData(stops, res, processTime) {
	// create html and write response
	var output = {};
	output['stops'] = [];

	function parseTime(timeString) {
		if (timeString){
			return timeString.split('T').slice(-1).toString().substring(0,5);
		}
	}

	stops.forEach(function(s){
		var loc = Object.keys(s)[0]
		var p = '<p>';
		var stop = s[loc];
		var stop_data = {
			location: stationNames[loc],
			ank_time: stop.Ankomst.AdvertisedTimeAtLocation ? parseTime(stop.Ankomst.AdvertisedTimeAtLocation) : false,
			avg_time: stop.Avgang.AdvertisedTimeAtLocation ? parseTime(stop.Avgang.AdvertisedTimeAtLocation) : false,
			track: stop.Avgang.TrackAtLocation ? stop.Avgang.TrackAtLocation : false,
			ank_deviation: stop.Ankomst.Deviation ? stop.Ankomst.Deviation.join('|') : '',
			avg_deviation: stop.Avgang.Deviation ? stop.Avgang.Deviation.join('|') : '',
			real_ank: stop.Ankomst.TimeAtLocation ? parseTime(stop.Ankomst.TimeAtLocation) : false,
			ber_avg: stop.Avgang.EstimatedTimeAtLocation ? parseTime(stop.Avgang.EstimatedTimeAtLocation) : false,
		};
		stop_data.deviation = stop_data.ank_deviation === stop_data.avg_deviation ? stop_data.ank_deviation : stop_data.ank_deviation + stop_data.avg_deviation;
		output.stops.push(stop_data)
	});
	output['processTime'] = processTime;
	output['lastUpdated'] = lastUpdated;
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost')
	res.writeHead(200, {'Content-type': 'text/plain'});
	res.end(JSON.stringify(output));

}

function onRequest(req,res){
	if (isNaN(req.url.slice(1))) {
		res.end('Invalid train number.');
		console.log('Invalid train number');
		return;
	}
	trainId = req.url.slice(1);
	console.log('Request for train nr ' + trainId)
	post(trainId, prepareData, res);
}

function init(stnNames) {
	stationNames = JSON.parse(stnNames);
	server(3000, onRequest);
}

getStationNames(init);
