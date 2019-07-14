import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express = require('express');
import cors from 'cors';
// import bodyParser from 'body-parser';
var cfenv = require("cfenv");
var cloudant, mydb;

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // await app.listen(3500);
  await app.listen(port,()=>{console.log(`port ${port} is connected to server`)});
}
bootstrap();


// app.use(bodyParser.json());

var vcapLocal;
try {
    vcapLocal = require('./vcap-local.json');
    console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal } : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {

    // Initialize database with credentials
    if (appEnv.services['cloudantNoSQLDB']) {
        // CF service named 'cloudantNoSQLDB'
        cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
    } else {
        // user-provided service with 'cloudant' in its name
        cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
    }
} else if (process.env.CLOUDANT_URL) {
    cloudant = Cloudant(process.env.CLOUDANT_URL);
}

if (cloudant) {
    //database name
    var dbName = 'mydb';


    // Create a new "mydb" database.
    // cloudant.db.create(dbName, function (err, data) {
    //     if (!err) //err if database doesn't already exists
    //         console.log("Created database: " + dbName);
    // });

    // Specify the database we are going to use (mydb)...
    mydb = cloudant.db.use(dbName);
}
//Listening Port
var port = process.env.PORT || 3500;

