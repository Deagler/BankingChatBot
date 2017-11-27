var request = require("request");


exports.saveBooking = (session, bookingData, callback) => {
    var url = 'http://msaassessment.azurewebsites.net/tables/bookingtable';
    var options = {
        url: url,
        method: 'POST',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        },
        json: {
            "username": bookingData.name,
            "time": bookingData.time,
            "description": bookingData.description,
            "severity": bookingData.severity,
            "deleteCode": bookingData.deleteCode
        }
      };
      
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            console.log(body)
            callback(session, bookingData)
        }
        else{
            console.log("not saved");
        }
      });
}

exports.genericBookingCard = (title, bookingData) => {
  var options = {  
    month: "long",  day: "numeric", hour: "2-digit", minute: "2-digit"
  };  

  var temptime = new Date(bookingData.time);
  var severityString = "";
  var severityColour = "";
  switch(bookingData.severity) {
    case 1:
      severityString = "High";
      severityColour = "attention";
      break;
    case 2:
      severityString = "Medium";
      severityColour = "warning";
      break;
    case 3:
      severityString = "Low";
      severityColour = "good";
      break;
    default:
      severityString = "Low";
      severityColour = "good";
      break;
  }

  var facts = [
    {
        "title": "Booking for:",
        "value": bookingData.name
    },
    {
        "title": "Time:",
        "value": temptime.toLocaleTimeString("en-us", options)
    },
    {
        "title": "Description:",
        "value": bookingData.description
    }
  ];

  var bookingCard = 
  {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.0",
      "body": [
        {
          "type": "TextBlock",
          "text": title,
          "size": "large",
          "weight": "bolder"
        },
        {
          "type": "FactSet",
          "facts": facts,
          "isSubtle":true
        },
        {
          "type": "TextBlock",
          "text": `**Severity:** ${severityString}`,
          "color": severityColour
        },
      ]
    }    

    return (bookingCard);

}

exports.reviewBookingCard = (bookingData) => {
    var options = {  
        month: "long",  day: "numeric", hour: "2-digit", minute: "2-digit"
    };  
    var temptime = new Date(bookingData.time);
    var facts = [
        {
            "title": "Booking for:",
            "value": bookingData.name
        },
        {
            "title": "Time:",
            "value": temptime.toLocaleTimeString("en-us", options)
        },
        {
            "title": "Description:",
            "value": bookingData.description
        }
    ]
    
    var reviewCard = 
    {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
              {
                "type": "TextBlock",
                "text": "Booking Details:",
                "size": "large",
                "weight": "bolder"
              },
              {
                "type": "FactSet",
                "facts": facts,
                "isSubtle":true
              },
              {
                "type": "TextBlock",
                "text": "Severity",
                "weight": "bolder"
              },
              {
                "type": "Input.ChoiceSet",
                "id": "severity",
                "style":"compact",
                "value": "3",
                "choices": [
                  {
                    "title": "High",
                    "value": "1",
                  },
                  {
                    "title": "Medium",
                    "value": "2"
                  },
                  {
                    "title": "Low",
                    "value": "3",
                    "isSelected": "true"
                  }
                ]
              }
            ],
            "actions": [
              {
                "type": "Action.Submit",
                "title": "Confirm",
                "data": {
                    'type': "confirmBooking",
                    "booking": bookingData
                }
              },
              {
                "type": "Action.Submit",
                "title": "Cancel",
                "data": {
                    'type': "cancelBooking"
                }
              }
            ]
    }

    return (reviewCard);
    
}