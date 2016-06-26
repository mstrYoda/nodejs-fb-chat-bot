var request = require('request');
var http = require('http');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/keyword',function(req,res){
  getSuggestion(req,res);
});

function getSuggestion(req,res){
if(req.query.token == 12345){


request('http://suggestqueries.google.com/complete/search?output=client&client=firefox&hl=tr-TR&q='+req.query.keyword,
      function(error,response,body){
        if(!error && response.statusCode == 200){
          var donen = JSON.parse(body);
          var str = ''
          donen[1].forEach(function(entry){
            str += '<li>'+entry+'</li>';
          });
          res.send(str);
        }
      });

    }else{
      res.send('Bad Request');
    }
}

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 80!');
});
