var request = require('request');
var http = require('http');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));


app.get('/',function(req,res){
  res.send('hg bro');
});

app.get('/keyword',function(req,res){
  getSuggestion(req,res);
});

app.get('/webhook',function(req,res){
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'bu_token_cok_gizli') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
})

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
              res.status(200).json(body);
            }
          });

    }else{
      res.send('Hatalı istek');
    }
}

app.listen(app.get('port'), function () {
  console.log('Port dinleniyor...!');
});
