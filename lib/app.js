import * as bot from './bot';
import config from 'config';
import Watson from 'watson-developer-cloud/conversation/v1';
import uuid from 'uuid';

const WORKSPACE = (process.env.WORKSPACE) ? process.env.WORKSPACE : config.get('WORKSPACE');

let logs = null;

let conversation = new Watson( {
  password: config.get('password'),
  username: config.get('username'),
  url: config.get('url'),
  version_date: config.get('version_date'),
  version: config.get('version')
} );

bot.app.post( '/api/message', function(req, res) {
  let payload = {
    workspace_id: WORKSPACE,
    context: {},
    input: {}
  };

  console.log('/api/message');

  if ( req.body ) {
    if ( req.body.input ) {
      payload.input = req.body.input;
    }
    if ( req.body.context ) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }
  // Send the input to the conversation service
  conversation.message( payload, function(err, data) {
    if ( err ) {
      return res.status( err.code || 500 ).json( err );
    }
    return res.json( updateMessage( payload, data ) );
  } );
} );

function updateMessage(input, response) {
  let responseText = null;
  let id = null;
  if ( !response.output ) {
    response.output = {};
  } else {
    if ( logs ) {
      // If the logs db is set, then we want to record all input and responses
      id = uuid.v4();
      logs.insert( {'_id': id, 'request': input, 'response': response, 'time': new Date()});
    }
    return response;
  }
  if ( response.intents && response.intents[0] ) {
    let intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if ( intent.confidence >= 0.75 ) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if ( intent.confidence >= 0.5 ) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  if ( logs ) {
    // If the logs db is set, then we want to record all input and responses
    id = uuid.v4();
    logs.insert( {'_id': id, 'request': input, 'response': response, 'time': new Date()});
  }
  return response;
}


bot.payloadRules.set('Search', defaultProcessing);

function defaultProcessing(recipientId, query){
    console.log(recipientId)
    console.log(query)

    let payload = {
        workspace_id: WORKSPACE,
        context: {},
        input: {
            text: query
        },
        "context": {
            "conversation_id": "21bc1fa5-be2c-486d-8d31-4944d611d667",
            "system": {
                "dialog_stack": [
                    {
                        "dialog_node": "root"
                    }
                ],
                "dialog_turn_counter": 2,
                "dialog_request_counter": 2
            }
        }
    };

    conversation.message( payload, function(err, data) {
        console.log(data);

        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                "text":   data.output.text[0]
            }
        };

        bot.sendTypingOff(recipientId);
        return bot.callSendAPI(messageData);
        //return res.json( updateMessage( payload, data ) );
    } );
}

module.exports = bot.app;
