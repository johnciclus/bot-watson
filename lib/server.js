import express from 'express';
import cfenv from 'cfenv';
import config from 'config';
import bodyParser from 'body-parser';

const PORT = (process.env.PORT) ? process.env.PORT : config.get('PORT');

let app = express();
let appEnv = cfenv.getAppEnv();

app.set('port', PORT);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

module.exports = {app, express, appEnv};
