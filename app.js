var request = require('request');
var url = require('url');
var express = require('express');
var app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.locals.secondsToTime = function(totalSec){
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    return hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

app.locals.timeToString = function(time){
    var d = new Date();
    d.setTime(time * 1000);
    return d.toLocaleTimeString() + " " + d.toDateString();
}

app.get('/', function(request, response){
    response.sendfile(__dirname + '/index.html');
});

app.get('/match/:match_id', function(req, response){
    var account_id = req.params.account_id;
    var match_id = req.params.match_id;

    options = {
        protocol: 'https:',
        host: 'api.steampowered.com',
        pathname: '/IDOTA2Match_570/GetMatchDetails/V001/',
        query: {key: '0BDF16C29E3E9C541EF3AF2379797588', match_id: match_id}
    }

    var dotaUrl = url.format(options);
    request(dotaUrl, function(err, res, body){
        var match = JSON.parse(body);
        response.render('match.ejs', {players: match.result.players,
                                      match_id: match_id,
                                      result: match.result});
    });
});

app.get('/player/:account_id', function(req, response){
    var account_id = req.params.account_id;

    options = {
        protocol: 'https:',
        host: 'api.steampowered.com',
        pathname: '/IDOTA2Match_570/GetMatchHistory/V001/',
        query: {key: '0BDF16C29E3E9C541EF3AF2379797588', account_id: account_id}
    }

    var dotaUrl = url.format(options);
    request(dotaUrl, function(err, res, body){
        var account = JSON.parse(body);
        response.render('account.ejs', {matches: account.result.matches, 
                                        account_id: account_id});
    });
});

app.listen(8080);