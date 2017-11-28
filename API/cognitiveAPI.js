var request = require("request");

/*
        Endpoint: https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0
        Key 1: b5ca65ac95aa4e1e83a26150bf92d822
        Key 2: fc9f1fdcc6844842811a6a4acba735ac
*/
exports.analyseSentiment = (text, session, callback) => {
   var url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';

   var toJSON = {
       "documents": [
            {
               "id":1,
               "language":"en",
               "text": text
            }
       ]
   };
   var options = {
       url: url,
       method: 'POST',
       headers: {
           'Ocp-Apim-Subscription-Key': 'b5ca65ac95aa4e1e83a26150bf92d822',
           'Content-Type':'application/json'
       },
       json: toJSON
     };
     
     request(options, function (error, response, body) {
    
       if (!error && response.statusCode == 200) {

           callback(session, body);
       }
       else{
           console.log("failed to analyse sentiment data.");
       }
     });

}