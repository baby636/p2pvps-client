/*
 * Copyright 2017 RPiOVN.org
 * Licensing Information: MIT License
 *
 * This library file handle communication with the P2P VPS server.
 */

"use strict";

// Libraries
//const fs = require("fs");
const request = require("request"); //Used for CURL requests.
const rp = require("request-promise");
let logr;

// Globals
//let globalThis; //Used in functions below when 'this' loses context.
const CHECK_EXPIRATION_PERIOD = 60000 * 2;
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
          url: `http://${this.serverIp}:${this.serverPort}/api/devicePublicData/${
            this.deviceId
          }/register`,
          form: config.deviceSpecs,
        },
        function(error, response, body) {
          try {
            //If the request was successfull, the server will respond with username, password, and port to be
            //used to build the Docker file.
            if (!error && response.statusCode === 200) {
              //Convert the data from a string into a JSON object.
              const data = JSON.parse(body); //Convert the returned JSON to a JSON string.

              console.log(`Username: ${data.clientData.username}`);
              console.log(`Password: ${data.clientData.password}`);
              console.log(`Port: ${data.clientData.port}`);

              return resolve(data.clientData);
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
      uri: `http://p2pvps.net/api/devicePublicData/${deviceId}`,
      json: true, // Automatically stringifies the body to JSON
    };

    return rp(options).then(function(data) {
      //debugger;

      if (data.collection === undefined) throw `No devicePublicModel with ID of ${deviceId}`;

      return data.collection;
    });
  }

  // This function returns a devices expiration date given the deviceId.
  getExpiration(deviceId) {
    //debugger;

    const options = {
      method: "GET",
      uri: `http://p2pvps.net/api/getDeviceExpiration/${deviceId}`,
      json: true, // Automatically stringifies the body to JSON
    };

    return rp(options).then(function(data) {
      //debugger;

      if (data.expiration === undefined)
        throw `Could not retrieve expiration for device ${deviceId}`;

      return new Date(data.expiration);
    });
  }

  startExpirationTimer() {
    checkExpirationTimer = setInterval(() => {
      this.checkExpiration();
    }, CHECK_EXPIRATION_PERIOD);
  }

  // This function is called by a timer after the Docker contain has been successfully
  // launched.
  checkExpiration() {
    debugger;

    const now = new Date();
    logr.log(`checkExpiration() running at ${now}`);

    // Get the expiration date for this device from the server.
    getExpiration(deviceConfig.deviceId)
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

                registerDevice(); // Re-register the device with the server.
              })
          );
        }
      })

      .catch(err => {
        debugger;
        logr.error("Error in checkExpiration(): ");

        if (err.statusCode >= 500 || err.name === "RequestError") {
          logr.error("Connection to the server was refused. Will try again.");
        } else {
          debugger;
          logr.error(JSON.stringify(err, null, 2));
        }
      });
  }
}

module.exports = P2pVpsServer;
