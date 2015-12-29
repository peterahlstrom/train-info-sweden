# train-info-sweden
A node.js wrapper for Trafikverket's API


###Introduction

train-info-sweden is a wrapper for the Swedish Transport Administration Trafikverket's open API for info regarding trains. It's a server application written in node.js. You set it up as a service on your server, send a request for the train id-number from your webapp and recieve JSON-data as explained below. All processing is done on the server, the client only need to handle the display.

To use it you need a personal API key obtained via [Trafikverket](http://api.trafikinfo.trafikverket.se/) or [Trafiklab](https://www.trafiklab.se/api/trafikverket-oppet-api)

<br />

####Preconditions
node.js and npm: [https://nodejs.org/download/](https://nodejs.org/download/)

<br />

####Clone and install dependencies
With git:
```
git clone https://github.com/peterahlstrom/train-info-sweden.git
```
or svn:
```
svn co https://github.com/peterahlstrom/train-info-sweden.git
```
Install dependencies
```
cd train-info-sweden
npm install
```

<br />

####Usage
Edit the config.json file.
```
{
	"api_key": "insert your api key here", //get you own at http://api.trafikinfo.trafikverket.se/
	"server_port": "3000" //the port your application listen on
}
```

Start the server
```
node train_info.js
```

<br />


Request the service at http://server:port/train_id.
Example: http://example.com:3000/535

<br />

The response is a JSON-object like the following example:
```
{
	"stops":[
				{
					"location":"Stockholm Central",
					"ank_time":false,
					"avg_time":"13:21",
					"track":"11",
					"deviation":false,
					"real_ank":false,
					"ber_avg":"13:28"
				},
				{
					"location":"Norrköping C",
					"ank_time":"14:33",
					"avg_time":"14:35",
					"track":"1",
					"deviation":"Halt på perrongen, buss ersätter.",
					"real_ank":"14:48",
					"ber_avg":"14:50"
				},
				{
					"location":"Malmö C",
					"ank_time":"17:47",
					"avg_time":false,
					"track":false,
					"deviation":"ID-kontroller gör att fortsatt resa till Köpenhamn tar ca en timme längre tid.",
					"real_ank":false,
					"ber_avg":false
				}
			]
}
```

<br />

####Questions, comments, bugs
If you have questions or comments, please use Github's issue tracker or contact me at ahlstrom(dot)peter(at)gmail(dot)com

