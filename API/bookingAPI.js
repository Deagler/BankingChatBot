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
            callback(session, body);
        }
        else{
            console.log("not saved");
        }
      });
}

exports.getBookings = (session, username, callback) => {
  var url = 'http://msaassessment.azurewebsites.net/tables/bookingtable';
  var options = {'headers':{'ZUMO-API-VERSION': '2.0.0'}};
  request.get(url, options, (err, resp, body) => {
    if(err) {
      console.log(err)
    } else {
      callback(body, session, username);
    }
  });

}

exports.deleteBooking = (session, deletecode, callback) => {
  var url = 'http://msaassessment.azurewebsites.net/tables/bookingtable';
  var options = {'headers':{'ZUMO-API-VERSION': '2.0.0'}};

  /* Getting all the bookings */
  request.get(url, options, (err, resp, body) => {
    if(err) {
      console.log(err)
    } else {
      var bookings = JSON.parse(body);

      for(var index in bookings) {
        var booking = bookings[index];
        
        if(booking.deleteCode == deletecode) {
          var options = {
            url: url + "\\" + booking.id,
            method: 'DELETE',
            headers: {
                'ZUMO-API-VERSION': '2.0.0',
                'Content-Type':'application/json'
            }
          };
          request(options,function (err, res, body){
            if( !err && res.statusCode === 200){
                callback(body, session);
            }else {
                console.log(err);
                console.log(res);
            }
        })
        }
      }
     }
  });
  
}

exports.genericBookingCard = (title, bookingData) => {
  var options = {  
    month: "long",  day: "numeric", hour: "2-digit", minute: "2-digit", year: "numeric"
  };  

  var temptime = new Date(bookingData.time);
  var temptime2 = new Date(bookingData.createdAt);
  var severityString = "";
  var severityColour = "";
  switch(bookingData.severity) {
    case "1":
      severityString = "High";
      severityColour = "warning";
      break;
    case "2":
      severityString = "Medium";
      severityColour = "attention";
      break;
    case "3":
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
        "value": bookingData.username
    },
    {
        "title": "Time:",
        "value": temptime.toLocaleTimeString("en-us", options)
    },
    {
        "title": "Description:",
        "value": bookingData.description
    },
    {
      "title": "Created At:",
      "value": temptime2.toLocaleTimeString("en-us", options)
    }
  ];

  var bookingCard = 
  {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "speak": `Booking for ${bookingData.description} at ${temptime.toLocaleTimeString("en-us", options)} under the name ${bookingData.username}. Booking created at ${temptime2.toLocaleTimeString("en-us", options)}`,
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
          "text": `**Urgency:** ${severityString}`,
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
            "speak": `Would you like to confirm your booking for ${bookingData.description} at ${temptime.toLocaleTimeString("en-us", options)} under the name ${bookingData.name}`,
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
                "text": "Urgency",
                "weight": "bolder"
              },
              {
                "type": "Input.ChoiceSet",
                "id": "severity",
                "style":"compact",
                "value": bookingData.severity.toString(),
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
                    "value": "3"
                    //"isSelected": "true"
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