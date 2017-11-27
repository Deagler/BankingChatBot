var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/LuisDialog');
var booking = require('./API/bookingAPI');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: "eaaf54a6-f264-4bdb-9138-6bf6fb13e1bd",
    appPassword: "pVYV582[unlnuySPGO39_?$"
});


server.post('/api/messages', connector.listen());

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

var bot = new builder.UniversalBot(connector, function (session) {
    if(session.message && session.message.value) {
        var data = session.message.value;
        if(data.type == "cancelBooking") {
            session.send("Booking was not saved") // are you done? yes/no, Leave feedback, sentiment analysis

        } else if (data.type == "confirmBooking") {
  
            data.booking.severity = data.severity;
            data.booking.deleteCode = randomString(7);
            
            session.sendTyping();
            booking.saveBooking(session, data.booking, (session, bookingData) => {
                var bookingCard = booking.genericBookingCard("Booking Saved!", bookingData);
                var msg = new builder.Message(session).addAttachment({
                  contentType: "application/vnd.microsoft.card.adaptive",
                  content: bookingCard
                });
    
                session.send(msg);
                session.send("Booking successfully saved! Your unique delete code for this booking is: "+bookingData.deleteCode);
            });
            
        }
            
    } else {
        session.send("Error occcured, Try entering a command such as: 'Get stock for microsoft' or 'book an appointment'");
    }
    
});
    

luis.startDialog(bot);