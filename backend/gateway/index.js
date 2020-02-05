"use strict";

var fs = require('fs');
var http = require('http');
var https = require('https');

const express = require("express");
const multer = require("multer");

var privateKey  = fs.readFileSync(process.env.TLSKEY, 'utf8');
var certificate = fs.readFileSync(process.env.TLSCERT, 'utf8');
var credentials = {key: privateKey, cert: certificate};
var forceSsl = require('express-force-ssl');

const db = require("./middleware/db");

const users = require("./handlers/users");

const app = express();

// Forces a secure connection
app.use(forceSsl);
// JSON parsing for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
// JSON parsing for application/json
app.use(express.json());
// JSON parsing for multipart/form-data (required with FormData)
app.use(multer().none());

// Establish a connection with the database and pass the connection 
// along in the request object
app.use(db.getDB);

// ----- API Routes -----

async function handleHome(req, res) {
  console.log("Just heard something bruh!");
  res.set("Content-Type", "text/plain");
  res.status(200).send("I heard you bruh.");
}

app.get("/", handleHome);

// Handle creating a new user
app.post("/users", users.createNewUser);

http.createServer(app).listen(80);
https.createServer(credentials, app).listen(443);