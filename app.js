var request = require('request');
var url = require('url');
var express = require('express');
var app = express();
var redis = require('redis');
var $ = require('jquery');
var heroJSON;
var itemJSON;

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.locals.secondsToTime = function(totalSec){
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;
    var dateString = (hours <= 0 ? "" : hours + ":") + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds)
    return dateString;
}

app.locals.timeToString = function(time){
    var d = new Date();
    d.setTime(time * 1000);
    return d.toLocaleTimeString() + " " + d.toDateString();
}

app.locals.hero_idToName = function(hero_id){
    for (var i = 0; i < heroJSON.heroes.length; i++){
        if (hero_id == heroJSON.heroes[i].id){
            return 'http://media.steampowered.com/apps/dota2/images/heroes/' + heroJSON.heroes[i].name + '_sb.png';
        }
    }
    return "Hero not found.";
}

app.locals.hero_idLocalizeName = function(hero_id){
    for (var i = 0; i < heroJSON.heroes.length; i++){
        if (hero_id == heroJSON.heroes[i].id){
            return heroJSON.heroes[i].localized_name;
        }
    }
    return "";
}

app.locals.itemToName = function(item){
    if (item == 0){
        return '';
    }
    for (var i = 0; i < itemJSON.items.length; i++){
        if (item == itemJSON.items[i].id){
            return '<img src="http://media.steampowered.com/apps/dota2/images/items/' + itemJSON.items[i].name + '_eg.png">';
        }
    }
}

app.get('/heroes.json', function(request, response){
    response.sendfile(__dirname + '/heroes.json');
});

app.get('/items.json', function(request, response){
    response.sendfile(__dirname + '/items.json');
});

app.get('/', function(req, response){
    options = {
        protocol: 'http:',
        host: 'localhost:8080',
        pathname: '/heroes.json'
    }

    var heroUrl = url.format(options);
    request(heroUrl, function(err, res, body){
        heroJSON = JSON.parse(body);
    });

    options2 = {
        protocol: 'http:',
        host: 'localhost:8080',
        pathname: '/items.json'
    }

    var itemUrl = url.format(options2);
    request(itemUrl, function(err, res, body){
        itemJSON = JSON.parse(body);
    });

    response.sendfile(__dirname + '/index.html');
});

app.get('/match/:match_id', function(req, response){
    var account_id = req.params.account_id;
    var match_id = req.params.match_id;

    options = {
        protocol: 'https:',
        host: 'api.steampowered.com',
        pathname: '/IDOTA2Match_570/GetMatchDetails/V001/',
        query: {key: '7457139B765A368251CF1C88001496A3', match_id: match_id}
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
        query: {key: '7457139B765A368251CF1C88001496A3', account_id: account_id}
    }

    var dotaUrl = url.format(options);
    request(dotaUrl, function(err, res, body){
        var account = JSON.parse(body);
        response.render('account.ejs', {matches: account.result.matches, 
                                        account_id: account_id});
    });
});

app.listen(8080);