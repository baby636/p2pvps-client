/*
 * Copyright 2018 Chris Troutner & P2P VPS Inc.
 * Licensing Information: MIT License
 *
 * This library file handle communication with the P2P VPS server.
 */

"use strict";

// Libraries
//const fs = require("fs");
const request = require("request"); //Used for CURL requests.
const rp = require("request-promise");
const execa = require("execa");
const getStream = require("get-stream");
let logr;

// Globals
//let globalThis; //Used in functions below when 'this' loses context.
const CHECK_EXPIRATION_PERIOD = 60000 * 6;
let checkExpirationTimer;

class P2pVpsServer {
  constructor(deviceConfig, logger) {
    this.deviceId = deviceConfig.deviceId;
    this.serverIp = deviceConfig.serverIp;
    this.serverPort = deviceConfig.serverPort;
    this.sshServer = deviceConfig.sshServer;
    this.sshServerPort = deviceConfig.sshServerPort;

    // Copy handle to logging system to higher scoped variable.
    logr = logger;
  }

  register(config) {
    return new Promise((resolve, reject) => {
      //debugger;

      //Register with the server by sending the benchmark data.
      request.post(
        {
          url: `http://${this.serverIp}:${this.serverPort}/api/client/register/${this.deviceId}`,
          form: config.deviceSpecs,
        },
        function(error, response, body) {
          try {
            //If the request was successfull, the server will respond with username, password, and port to be
            //used to build the Docker file.
            if (!error && response.statusCode === 200) {
              //Convert the data from a string into a JSON object.
              const data = JSON.parse(body); //Convert the returned JSON to a JSON string.

              //console.log(`data: ${JSON.stringify(data, null, 2)}`);
              console.log(`Username: ${data.device.username}`);
              console.log(`Password: ${data.device.password}`);
              console.log(`Port: ${data.device.port}`);

              return resolve(data);
            }

            if (error) {
              if (error.code === "EHOSTUNREACH") {
                console.error("Could not connect to server! Exiting.");
              } else if (error.code === "ECONNREFUSED") {
                console.error(
                  "Server could not establish a connection. It may be down temporarily. Try again later."
                );
              }
            } else {
              console.error(
                "Server responded with error when trying to register the device: ",
                error
              );
              console.error(
                "Ensure the ID in your deviceGUID.json file matches the ID in the Owned Devices section of the marketplace."
              );
              console.log(JSON.stringify(error, null, 2));
            }

            process.exit(1); // Exit the application.
          } catch (err) {
            console.log(`p2p-vps-server.js/register() exiting with error: ${err}`);
          }
        }
      );
    });
  }

  // This function returns a devicePublicModel given the deviceId.
  getDevicePublicModel(deviceId) {
    //debugger;

    const options = {
      method: "GET",
      uri: `http://${this.serverIp}:${this.serverPort}/api/device/${deviceId}`,
      json: true, // Automatically stringifies the body to JSON
    };

    return rp(options).then(function(data) {
      //debugger;
      console.log(`data: ${JSON.stringify(data, null, 2)}`);
      if (data.collection === undefined) throw `No devicePublicModel with ID of ${deviceId}`;

      return data.collection;
    });
  }

  // This function returns a devices expiration date given the deviceId.
  getExpiration(deviceId) {
    //debugger;

    const options = {
      method: "GET",
      uri: `http://${this.serverIp}:${this.serverPort}/api/client/expiration/${deviceId}`,
      json: true, // Automatically stringifies the body to JSON
    };

    return rp(options).then(function(data) {
      //debugger;

      if (data.expiration === undefined)
        throw `Could not retrieve expiration for device ${deviceId}`;

      return new Date(data.expiration);
    });
  }

  startExpirationTimer(registerFunc) {
    //console.log(`p2p-vps-server.js/startExpirationTime(registerFunc): ${typeof registerFunc}`);

    if (registerFunc === undefined) throw "register() function not defined.";

    checkExpirationTimer = setInterval(() => {
      //console.log(`p2p-vps-server.js/setInterval(registerFunc): ${typeof registerFunc}`);
      this.checkExpiration(registerFunc);
    }, CHECK_EXPIRATION_PERIOD);
  }

  // This function is called by a timer after the Docker contain has been successfully
  // launched.
  checkExpiration(registerFunc) {
    debugger;
    //console.log(`p2p-vps-server.js/checkExpiration(registerFunc): ${typeof registerFunc}`);

    if (registerFunc === undefined) throw "register() function not defined.";

    const now = new Date();
    logr.log(`checkExpiration() running at ${now}`);

    // Get the expiration date for this device from the server.
    this.getExpiration(this.deviceId)
      // Check expiration date.
      .then(expiration => {
        //const now = new Date();

        logr.log(`Expiration date: ${expiration}`);
        logr.debug(`Expiration type: ${typeof expiration}`);

        const expirationDate = new Date(expiration);

        // If the expiration date has been reached
        if (expirationDate.getTime() < now.getTime()) {
          // Stop the docker container.
          logr.log("Stopping the docker container");
          const stream = execa("./lib/stopImage").stdout;

          stream.pipe(process.stdout);

          return (
            getStream(stream)
              // Clean up any orphaned docker images.
              .then(output => {
                const stream2 = execa("./lib/cleanupImages").stdout;

                stream2.pipe(process.stdout);

                return getStream(stream2);
              })

              // Reregister the device.
              .then(output => {
                debugger;
                clearInterval(checkExpirationTimer); // Stop the timer.

                //registerDevice(); // Re-register the device with the server.
                //console.log(
                //  `p2p-vps-server.js/startExpirationTime2(registerFunc): ${typeof registerFunc}`
                //);
                registerFunc();
              })
          );
        }
      })

      .catch(err => {
        debugger;
        logr.error("Error in checkExpiration(): ");

        if (err.error) {
          if (err.statusCode >= 500 || err.name === "RequestError") {
            logr.error("Connection to the server was refused. Will try again.");
          } else {
            debugger;
            logr.error(`Error stringified: ${JSON.stringify(err, null, 2)}`);
          }
        }
      });
  }
}

module.exports = P2pVpsServer;
