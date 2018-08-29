var originalURL = "http://livescore-api.com/api-client/scores/live.json?key=gop822jNO6z33GAq&secret=iglZeHtSNGjCucWKAmTCocqdiZhlGSMY";
var queryURL = "https://cors-anywhere.herokuapp.com/" + originalURL;
var matchs = {};

var adjustMinutes =  function (dt, minutes, add) {
	return (add) ? new Date(dt.getTime() + minutes*60000) : new Date(dt.getTime() - minutes*60000);
}
var addZero = function (i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
var addTimeToDate = function (thedate, secnds, add) {
	var matchEnded = new Date((adjustMinutes(new Date(thedate), secnds, add).toString()));
	var getDay = addZero(matchEnded.getDate());
	var getMonth = addZero(matchEnded.getMonth() + 1);
	var getYear = matchEnded.getFullYear();
	var getHours = addZero(matchEnded.getHours());
	var getMin = addZero(matchEnded.getMinutes());
	var getSec = addZero(matchEnded.getSeconds());
	return (getYear+'-'+getMonth+'-'+getDay+' '+getHours+':'+getMin+':'+getSec);
}
$.ajax({
	url: queryURL,
	method: "GET",
	dataType: "json",
	headers: {
		"x-requested-with": "xhr"
	}
}).done(function(response) {
	$('#live-score-container thead').append('<tr><th width="20%">Match Status</th><th>Match Event</th><th width="20%">Match Score</th><th width="20%">Match Winner</th><th>Match Ended</th></tr>');
	
	var result = response.data;
	var matchObj = {};
	$.each(result.match, function(i, value) {
		if(!(typeof matchObj[value.league_name] === 'object'))matchObj[value.league_name] = {};
		matchObj[value.league_name][value.id] = value;
	});
	
	$.each(matchObj, function(i, value){
		$('#live-score-container tbody').append('<tr class="league-title"><td colspan="5">'+i+'</td></tr>')
		$.each(this, function(){
			var matchEnd = addTimeToDate(this.last_changed, 420, true);
			var matchStart = addTimeToDate(this.added, 420, true);
			var currentDate = addTimeToDate(new Date(), 60, false);
			var timeDiff = ((new Date(currentDate).getTime() - new Date(matchEnd).getTime()) / 1000);
			switch(true) {
				case timeDiff <= 59:
					timeDiff = Math.floor(timeDiff) +"s ago";
					break;
				case timeDiff <= 3599:
					timeDiff = Math.floor((timeDiff / 60)) +"m ago";
					break;
				default:
					timeDiff = Math.floor((timeDiff / 3600)) +"h ago";
					break;
			}
			
			var matchWinner;
				score = this.score.split('-');
				homeScore = parseInt(score[0]);
				awayScore = parseInt(score[1]);
			
			if(homeScore > awayScore){matchWinner = this.home_name;}
			else if (homeScore < awayScore){matchWinner = this.away_name;}
			else {matchWinner = 'Draw!';};
			
			$('#live-score-container tbody').append('<tr class="match-single ">\
				<td class="match-info"><span class="match-status">'+this.status+'</span><br/><span class="match-time">'+this.time+'</span></td>\
				<td class="match-teams"><span class="match-home-team">'+this.home_name+'</span><br/><span class="match-away-team">'+this.away_name+'</span></td>\
				<td class="match-score">'+this.score+'</td>\
				<td class="match-winner">'+((this.status == "FINISHED") ? matchWinner : ' Match Ongoing.' )+'</td>\
				<td class="match-ended">'+matchEnd+'<br/>'+timeDiff+'</td>\
			</tr>');
		});
	});
}).fail(function(jqXHR, textStatus) {
	console.error(textStatus)
});