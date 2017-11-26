var builder = require('botbuilder');




exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e83d3f5b-3fb7-4ca9-9bee-e806d2b38f40?subscription-key=3ea31847e9574a0ab50e5be888236823&verbose=true&timezoneOffset=0&q=');
    
    bot.recognizer(recognizer);

    bot.dialog('SearchStocks', function (session, args) {

        var companyObj = builder.EntityRecognizer.findEntity(args.intent.entities, 'company');

        session.send(`Retrieving stocks for '${companyObj.entity}'`);
    }).triggerAction({
        matches: 'SearchStocks'
    });

    

}