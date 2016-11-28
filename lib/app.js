import * as bot from './bot';
import {createLocalStore, getData} from './localStore'
import config from 'config';
import rp from 'request-promise';
import objectAssign from 'object-assign';
import Watson from 'watson-developer-cloud';
import Conversation from 'watson-developer-cloud/conversation/v1';

const WORKSPACE = (process.env.WORKSPACE) ? process.env.WORKSPACE : config.get('WORKSPACE');

const SERVER_URL = (process.env.SERVER_URL) ? process.env.SERVER_URL : config.get('SERVER_URL');

const initialState = {
    userData: {}
};

const reducer = (state = initialState, action) => {
    console.log('ACTION');
    console.log(action);
    let data = action.data;

    if(data && data.hasOwnProperty('recipientId')){
        if(typeof state.userData[data.recipientId] != 'object'){
            state.userData[data.recipientId] = {};
        }
    }
    return {...state};
}

let conversation = new Conversation( {
    password: config.get('conversation_password'),
    username: config.get('conversation_username'),
    url: config.get('conversation_url'),
    version_date: config.get('conversation_version_date'),
    version: config.get('conversation_version')
} );

let personality_insights = Watson.personality_insights({
    password: config.get('personality_password'),
    username: config.get('personality_username'),
    version: config.get('personality_version'),
    version_date: config.get('personality_version_date'),
    headers: {
        "X-Watson-Learning-Opt-Out": 1
    }
});

let visual_recognition = Watson.visual_recognition({
    api_key: config.get('visual_api_key'),
    version: config.get('visual_version'),
    version_date: config.get('visual_version_date')
});

let twitterText = "Pocos artistas hispanoamericanos han logrado tanta repercusión a nivel internacional como el pintor y escultor colombiano Fernando Botero. Su personalísimo estilo, que tiene entre sus rasgos más fácilmente identificables el agrandamiento o la deformación de los volúmenes, ha merecido la admiración tanto de la crítica como del gran público, que no puede sustraerse a la singular expresividad de una estética en la que las problemáticas humanas y sociales ocupan un lugar prioritario. Nacido en Medellín en 1932, Fernando Botero fue el segundo de los tres hijos de la pareja formada por David Botero Mejía y Flora Angulo de Botero. Aunque en su juventud estuvo durante un corto lapso de tiempo en la Academia de San Fernando en Madrid y en la de San Marcos en Florencia, su formación artística fue autodidacta. Sus primeras obras conocidas son las ilustraciones que publicó en el suplemento literario del diario El Colombiano, de su ciudad natal. A los 19 años viajó a Bogotá, donde hizo su primera exposición individual de acuarelas, gouaches, tintas y óleos en la Galería Leo Matiz, y con lo recaudado vivió algún tiempo en Tolú. De su estancia allí saldría el óleo Frente al mar, con el que obtuvo el segundo premio de pintura, consistente en dos mil pesos, en el IX Salón Anual de Artistas Colombianos. El crítico Walter Engel, en El Tiempo del 17 de agosto de 1952, encontró que tenía una composición vigorosa, bien construida y bien realizada, pero el escritor Luis Vidales lo criticó por su inconceptual alargamiento de las figuras. Viajó entonces Botero a Europa, donde residió por espacio de cuatro años, principalmente en Madrid, Barcelona, París y Florencia. Aunque ingresó en las academias mencionadas, siguió formándose a base de leer, visitar museos y, sobre todo, pintar, como él mismo diría. Luego viajó a México, Nueva York y Washington en un período de febril creación y escasos recursos económicos, acompañado de su esposa Gloria Zea. De nuevo en Colombia, Botero compartió el segundo premio y medalla de plata en el X Salón de Artistas Colombianos, con Jorge Elías Triana y Alejandro Obregón. Su óleo Contrapunto fue alabado por los críticos unánimemente, por su alegría contagiosa. La camera degli sposi obtuvo el primer premio en el XI Salón Nacional celebrado en septiembre de 1958. En esta obra Botero logró deshacerse de una lejana influencia del muralismo mexicano y dirigirse, sin titubeos y por medio de su admiración a los artistas del Renacimiento italiano, hacia la consolidación de lo que alguien llamó el boteroformismo.  El pintor había manifestado desde hacía cuatro años su admiración por el sereno monumentalismo de Paolo Ucello y por lo que Marta Traba llamó un Renacimiento de piedra, por la concepción-bloque de las formas, que también manejó Piero de la Francesca; en el Homenaje a Mantegna, la exacerbación de los volúmenes y la concreción o formas geométricas básicas (que Walter Engel relacionó con las esculturas precolombinas de San Agustín) lograron el nacimiento de una pintura profundamente original, tan antibarroca como anticlásica, tan antiexpresionista como antiabstracta, en palabras de Traba. De todas maneras, el premio en el XI Salón fue consagratorio. Entre 1961 y 1973 fijó su residencia en Nueva York. Luego viviría en París, alternando su residencia en la capital francesa con largas estancias en Pietrasanta o su finca en el pueblo cundinamarqués de Tabio. Hacia 1964, Fernando Botero hizo sus primeras incursiones en el campo escultórico con obras como Cabeza de obispo, figura que, hecha en pasta de aserrín y con ojos de vidrio, tenía claras reminiscencias de la imaginería colonial barroca. A partir de 1975, en Pietrasanta, se dedicaría a la escultura con entusiasmo: Parecía como si todo ese universo de figuras monumentales que fue desarrollando en la pintura -escribe Escallón- hubieran encontrado total eco en la tridimensionalidad. Hoy en día, la una alimenta a la otra. Gran parte de la riqueza imaginativa viene de la pintura, que le da ideas, soluciones, posibilidades... Botero desarticula la estructura pictórica para sintetizar la forma en una unidad escultórica. En 1977 expuso sus bronces por primera vez en el Grand Palais de París. Tras cuatro decenios de labor ininterrumpida, su reconocimiento en el campo escultórico se hizo también universal. Apoteósica fue la exposición de sus enormes esculturas en los Campos Elíseos en París durante el verano de 1992, y en el año siguiente en la Quinta Avenida de Nueva York, en Buenos Aires y en Madrid. Convertido ya en uno de los artistas vivos más cotizados del mundo, Botero no ha dejado nunca, sin embargo, de alzar la voz contra la injusticia y de mantener su arte en línea con la realidad histórica y social. Sirve para ilustrarlo una de sus más recientes series pictóricas, la que realizó sobre las torturas cometidas por los marines en la cárcel iraquí de Abu Ghraib (2003), en el marco de la ocupación norteamericana de Iraq. Presentada en 2005 en el Palacio Venecia de Roma, la fuerza turbadora de esta colección de cincuenta lienzos atestiguó además que el pulso y la creatividad del artista no ha menguado en absoluto con los años."

bot.payloadRules.set('Greeting', sendInitalMessage);

bot.payloadRules.set('Search', defaultProcessing);

bot.payloadRules.set('Image', defaultImageProcessing);


bot.defaultSearch = defaultProcessing;

createLocalStore(reducer);

bot.app.post( '/api/message', function(req, res) {
  let payload = {
    workspace_id: WORKSPACE,
    context: {},
    input: {}
  };

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

    return response;
}

function sendInitalMessage(recipientId){
    let userData = getData(recipientId);

    //getProfile(recipientId);

    rp({uri: SERVER_URL+'api/message',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        json: {

        }}).then(function(result){

        objectAssign(userData, {context: result.context})

        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "elements":[
                            {
                                "title":"Hola soy MedeBot",
                                "image_url": SERVER_URL+"img/logo_medellin.jpg",
                                "subtitle": "Soy tu asistente virtual de turismo en Medellin",
                                "buttons":[
                                    {
                                        "type":"web_url",
                                        "url": SERVER_URL,
                                        "title":"MedeBot Website"
                                    }
                                ]
                            }
                        ]
                    }
                }

            }
        };

        bot.sendTypingOff(recipientId);
        return bot.callSendAPI(messageData).then(()=>{
            renderMessage(recipientId, result.output.text[0]);
        });
    });
}

function renderMessage(recipientId, message){
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text": message
        }
    };

    bot.sendTypingOff(recipientId);
    return bot.callSendAPI(messageData)
}

function defaultProcessing(recipientId, query){
    let userData = getData(recipientId);
    let context = getData(recipientId, 'context');

    rp({uri: SERVER_URL+'api/message',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        json: {
            "input": {
                "text": query
            },
            "context": context
        }}).then(function(result){
            console.log('result');
            console.log(result);
            console.log('\n');

            objectAssign(userData, {context: result.context})

            let messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    "text":   result.output.text[0]
                }
            };

            bot.sendTypingOff(recipientId);
            return bot.callSendAPI(messageData).then(()=>{
                if(typeof result.entities != 'undefined' && result.entities.length > 0){
                    let entity = result.entities[0];

                    if(typeof entity != 'undefined'){
                        switch(entity.entity){
                            case 'food':
                                console.log(entity);
                                renderTipicRestaurant(recipientId).then(()=>{
                                    renderThanks(recipientId);
                                });
                                break;
                            case 'user':
                                getProfile(recipientId);
                                break;
                        }
                    }
                }

            });
        });

    /*
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
    */
}

function defaultImageProcessing(recipientId, url){
    console.log(url)

    let parameters = {
        url: url,
        classifier_ids: ['logos_1402199694'],
        owners: ['IBM','me'],    //me
        threshold: 0.5
    };

    visual_recognition.classify(parameters, function(err, result) {
        if (err)
            console.log(err);
        else{
            let classes = [];
            let text;
            let existCognitiva = false;
            if(typeof result.images != 'undefined' && result.images.length > 0){
                let image = result.images[0];

                if(image.classifiers.length > 0){
                    let classifier = image.classifiers[0];
                    classifier.classes.forEach(function(cls){
                        classes.push(cls);
                    });
                }
                else{
                    text = "No he reconocido tu imagen"
                }
            }
            if(classes.length >0){
                text = "He identificado que tu imagen es: \n"

                classes.forEach(function(cls){
                    text += "* " + cls.class+"\n"
                    if(cls.class == 'cognitiva'){
                        existCognitiva = true
                    }
                });

            }
            renderMessage(recipientId, text).then(()=>{
                if(existCognitiva){
                    renderCognitivaMessage(recipientId);
                }
            });

        }
            //console.log(JSON.stringify(res, null, 2));
    });
}

function renderTipicRestaurant(recipientId){
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"generic",
                    "elements":[
                        {
                            "title": "Hato viejo",
                            "image_url": SERVER_URL+"img/restaurant1.jpg",
                            "subtitle": "Restaurante típico Hatoviejo Medellín",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "http://hatoviejo.com/en/",
                                    "title":"HatoViejo Website"
                                }
                            ]
                        },
                        {
                            "title": "Sancho Paisa",
                            "image_url": SERVER_URL+"img/restaurant2.jpg",
                            "subtitle": "Restaurante con sabor casero y productos exclusivos",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "http://restaurantesanchopaisa.com/",
                                    "title":"SanchoPaisa Website"
                                }
                            ]
                        },
                        {
                            "title": "Mondongos",
                            "image_url": SERVER_URL+"img/restaurant3.jpg",
                            "subtitle": "Pequeño y acogedor restaurante en la Avenida san juan",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "http://mondongos.com.co/",
                                    "title":"Mondogos Website"
                                }
                            ]
                        }
                    ]
                }
            }

        }
    };

    bot.sendTypingOff(recipientId);
    return bot.callSendAPI(messageData);
}

function renderCognitiva(recipientId){
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"generic",
                    "elements":[
                        {
                            "title": "Cognitiva",
                            "image_url": SERVER_URL+"img/cognitiva.png",
                            "subtitle": "Empresa de soluciones cognitivas especializada en desarrollar las capacidades de Watson",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "http://cognitiva.la/cognitiva/",
                                    "title":"Cognitiva Website"
                                }
                            ]
                        }
                    ]
                }
            }

        }
    };

    bot.sendTypingOff(recipientId);
    return bot.callSendAPI(messageData);
}

function renderThanks(recipientId){
    renderMessage(recipientId, "Fue un placer ayudarte, una recomendación final, evita permanecer sentado mucho tiempo una vez hayas terminado de comer, pero tampoco realices ejercicios bruscos hasta que se haya realizado la digestión de los productos ingeridos.")
}

function renderThankYou(recipientId){
    renderMessage(recipientId, "Fue un placer ayudarte")
}

function renderCognitivaMessage(recipientId){
    renderMessage(recipientId, "Sabias que Cognitiva es una empresa de soluciones cognitivas especializada en desarrollar las capacidades de Watson en 23 países de habla hispana en Latinoamérica.\n Y esta desarrollando un evento en Medellin Colombia llamado Hackcaton cognitiva, para saber mas puedes acceder a la siguiente pagina web").then(()=>{
        renderCognitiva(recipientId)
    })
}

function getProfile(recipientId){

    let params = {};

    params.text = twitterText;

    return personality_insights.profile(params, (err, response)=>{
        let features = [];
        if(typeof err != 'undefined'){
            if(typeof response != 'undefined'){
                response.personality.forEach(function(feature){
                    if(feature.percentile > 0.30){
                        feature.children.forEach(function(item){
                            if(item.percentile > 0.65) {
                                features.push(item);
                            }
                        });
                    }
                })
            }
        }

        let text = "He encontrado que tu personalidad es: \n"

        features.forEach(function(feature){
            text += "* " + feature.name+"\n"
        });

        renderMessage(recipientId, text).then(()=>{
            renderPersonalPlaces(recipientId).then(()=>{
                renderThankYou(recipientId);
            });
        });
    })
}

function renderPersonalPlaces(recipientId){
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"generic",
                    "elements":[
                        {
                            "title": "Camara de comercio agenda cultural",
                            "image_url": SERVER_URL+"img/place1.jpg",
                            "subtitle": "Agenda Cultural: Arte en la Cámara, Programación noviembre",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "http://www.camaramedellin.com.co/site/Cultura-Camara/Manifestaciones-artisticas/Arte.aspx",
                                    "title":"Camara de comercio Medellin"
                                }
                            ]
                        },
                        {
                            "title": "UPB Exposición fotográfica",
                            "image_url": SERVER_URL+"img/place2.jpg",
                            "subtitle": "Exposición fotográfica: Las imágenes transmiten olores",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "https://www.upb.edu.co/es/evento/exposicion-fotografica-las-imagenes-transmiten-olores-diversity",
                                    "title":"UPB Website"
                                }
                            ]
                        },
                        {
                            "title": "Club intelecto",
                            "image_url": SERVER_URL+"img/place3.jpg",
                            "subtitle": "Cuatro cajas rojas flotan contra el horizonte de los barrios obreros de Medellín,",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url": "http://clubintelecto.com/city/parque-explora/",
                                    "title":"Parque explora Website"
                                }
                            ]
                        }
                    ]
                }
            }

        }
    };

    bot.sendTypingOff(recipientId);
    return bot.callSendAPI(messageData);
}


module.exports = bot.app;
