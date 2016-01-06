$(document).ready(function(){ 
	var content = $('#content');
	var trainId = location.search.substring(1);
	var stops;
	var display_template = '<tr><td><strong>{location}</strong></td><td>{ank_time}</td><td>{avg_time}</td><td>{track}</td>{deviation}</tr>';
	var output = 	'<h2>Tåg ' + trainId + '</h2>'+
					'<table><th></th><th>Ankomst <small><i>verklig</i></small></th>'+
					'<th>Avgång <small><i>beräknad</i></small></th><th>Spår</th>';
	document.title = 'Tåg ' + trainId;
	$.getJSON('http://localhost:3000/' + trainId, function(data) {
		data['stops'].forEach(function(stop){
		
		stop.ank_time = stop.real_ank ? stop.ank_time + '<span><i><small>' + stop.real_ank + '</small></i></span>' : stop.ank_time;
		stop.avg_time = stop.ber_avg ? stop.avg_time + '<span><i><small>' + stop.ber_avg + '</small></i></span>' : stop.avg_time;


		output += display_template
			.replace('{ank_time}', stop.ank_time ? stop.ank_time : '')
			.replace('{avg_time}', stop.avg_time ? stop.avg_time : '')
			.replace('{location}', stop.location ? stop.location : '')
			.replace('{track}', stop.track ? stop.track : '')
			.replace('{deviation}', stop.deviation ? '<td>'+stop.deviation+'</td>' : '');


		});
		output += 	'</table>'+
					'<p><small>Hämtningen tog ' + data.processTime +
					' sek. Uppdaterades senast ' + data.lastUpdated +
					'</small></p>'
		content.html(output);
	});
});