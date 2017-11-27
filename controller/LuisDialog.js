var builder = require('botbuilder');
var stocks = require('../API/stockAPI');



exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e83d3f5b-3fb7-4ca9-9bee-e806d2b38f40?subscription-key=3ea31847e9574a0ab50e5be888236823&verbose=true&timezoneOffset=0&q=');
    
    bot.recognizer(recognizer);

    bot.dialog('SearchStocks', function (session, args) {

        var companyObj = builder.EntityRecognizer.findEntity(args.intent.entities, 'company');
        
        if(!companyObj || companyObj == null || companyObj.entity == null) 
            return;

        // let user know we're grabbing their data!
        session.sendTyping();

        stocks.getStock(companyObj.entity, (data) => {
            console.log(data.price);
            var stockCard = stocks.buildStockCard(data);
            var msg = new builder.Message(session).addAttachment({
                contentType: "application/vnd.microsoft.card.adaptive",
                content: stockCard
            });

            session.send(msg);

        })
    }).triggerAction({
        matches: 'SearchStocks'
    });

    

}

