var request = require('request');
var http = require('http');
var parseString = require('xml2js').parseString;

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var jsonParser = bodyParser.json();

app.set('port', (process.env.PORT || 5000));
app.set('jeton','EAAII24KnAZBABAD5oYTZAIoolzWtAvvIDz49QAzgMV5eZBEVRydicvNrVxWHn9lS986W052TSpUVdRToRuZBcLc5MZB9gzr6MO63yVZCZBAXO3BqpiUhgkyuBavrWzDKeZAvNiv35LShCZCupDq77vbW3wKoNbmoJZCoTe5CqP5TnA9gZDZD');

app.get('/parse',function(req,res){
  getXml();
  res.sendStatus(200);
});

app.get('/',function(req,res){
  res.send('hg bro');
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
});

app.post('/webhook',jsonParser,function(req,res){

  var data = req.body;

  console.log(data);

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }



});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'Forum':
        sendTextMessage(senderID,"http://www.rootdeveloper.org");
        break;
      case 'Yardım':
        sendTextMessage(senderID,"Geçerli Komutlar : Yardım, Forum, Konular, Programlamaya Başlangıç");
        break;
      case 'Programlamaya Başlangıç':
        sendTextMessage(senderID,"Programlamaya başlangıç ve kitap önerileri için okuyunuz : http://rootdeveloper.org/showthread.php?tid=660");
        break;
      case 'Balyoz Dos':
        sendTextMessage(senderID,"Balyoz Dos şuan için aktif değildir. Biz daha iyisini yapana kadar takipte kalabilirsiniz.");
        break;
      case 'Teşekkürler':
        sendTextMessage(senderID,"Rica ederim.");
        break;
        
      case 'Konular':
        getXml(senderID);
        break;
      
      default:
        console.log('Geçerli bir komut girilmedi :' +messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function parseXml(xml,senderId){

  parseString(xml,function(error,result){
    for(feed in result.feed.entry){
      sendTextMessage(senderId,result.feed.entry[feed].title[0]._ + ' : ' + result.feed.entry[feed].link[0].$.href);
    }
  });

}

function getXml(senderId){
  request({
      uri: 'http://rootdeveloper.org/syndication.php?fid=&type=atom1.0&limit=15',
      method: 'GET'
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return parseXml(body,senderId);
      } else {
        console.error("Unable connect rootdeveloper.");
      }
  });
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: app.get('jeton') },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

app.listen(app.get('port'), function () {
  console.log('Port dinleniyor...!');
});
