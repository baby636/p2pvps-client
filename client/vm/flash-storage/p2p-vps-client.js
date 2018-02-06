/*
  This is the primary 'governor' application that drives a Client device and allows it to communicate
  with a P2P VPS Server. The scope of this application covers:

  * It reads the device-config.json file and registers the Client device with the P2P VPS server.

  * It builds the Docker container with information returned by the server after registration.

  * It launches the Docker container after being built.

  * It sends a heartbeat signal to the P2P VPS server every 10 minutes. The server responds with an
  expiration date.
    * (Maybe I can also send benchmark data to the server?)

  * When the expiration date is reached, or the Server can not be reached after 30 minutes, the governor
  software stops the Docker container and wipes the flash drive. It then reregisters itself with the
  P2P VPS marketplace.

  * If the Client can not make contact with the Server, it quietly retries to make contact every 2 minutes.

  Specifications for this program can be found here:
  https://github.com/P2PVPS/p2pvps-server/blob/master/specifications/client-specification.md
*/

/*
 * Copyright 2017 Chris Troutner & P2PVPS.org
 * MIT License. See LICENSE.md for details.
 */

//This file registers with the server
"use strict";

// Express Dependencies
const express = require("express");
const execa = require("execa");
const sudo = require("p2pvps-sudo");

// Global Variables
const app = express();
const port = 4000;

// Read in device-config.json file
let deviceConfig;
try {
  deviceConfig = require("./device-config.json");
  console.log(`Registering device ID ${deviceConfig.deviceId}`);
} catch (err) {
  const msg = "Could not open the device-config.json file! Exiting.";
  console.error(msg, err);
  process.exit(1);
}

// Each type of client shell will have a unique write-files.js library.
const WriteFiles = require("./lib/write-files.js");
const writeFiles = new WriteFiles(deviceConfig);

// Initialize the debugging logger.
const Logger = require("../../lib/logger.js");
const logr = new Logger(deviceConfig);

// Utility functions for dealing with the P2P VPS server. Shared by all clients.
const P2pVpsServer = require("../../lib/p2p-vps-server.js");
const p2pVpsServer = new P2pVpsServer(deviceConfig, logr);

// Create an Express server. Future development will allow serving of webpages and creation of Client API.
const ExpressServer = require("../../lib/express-server.js");
const expressServer = new ExpressServer(app, port);
expressServer.start();

const sudoOptions = {
  cachePassword: true,
  prompt: "Password for sudo is needed: ",
  password: deviceConfig.sudoPassword,
  spawnOptions: {
    /* other options for spawn */
  },
};

// This is a high-level function used to register this Client with the Server.
// It calls the registration function, writes out the support files, builds the Docker container,
// and launches the Docker container.
function registerDevice() {
  logr.debug(`Registering device ${deviceConfig.deviceId}`);

  //Simulate benchmark tests with dummy data.
  const now = new Date();
  const deviceSpecs = {
    memory: "Fake Test Data",
    diskSpace: "Fake Test Data",
    processor: "Fake Test Data",
    internetSpeed: "Fake Test Data",
    checkinTimeStamp: now.toISOString(),
  };

  const config = {
    deviceId: deviceConfig.deviceId,
    deviceSpecs: deviceSpecs,
  };

  const execaOptions = {
    stdout: "inherit",
    stderr: "inherit",
    //uid: 0,
    //gid: 0,
  };

  // Register with the server.
  p2pVpsServer
    .register(config)

    // Write out support files (Dockerfile, config.json)
    .then(clientData => {
      //debugger;

      // Save data to a global variable for use in later functions.
      global.clientData = clientData;

      return (
        // Write out the Dockerfile.
        writeFiles
          .writeDockerfile(clientData.port, clientData.username, clientData.password)

          // Write out the config file.
          .then(() => {
            return writeFiles.writeClientConfig();
          })

          .catch(err => {
            logr.error("Problem writing out support files: ", err);
          })
      );
    })

    // Wipe and mount the flash drive
    .then(() => {
      logr.log("Wiping and mounting persistent storage.");

      // Use the sudo() function to launch the script with sudo privledges.
      return new Promise(function(resolve, reject) {
        const child = sudo(["./lib/prep-flash-storage"], sudoOptions);

        child.stdout.on("data", function(data) {
          logr.log(data.toString());
        });

        child.on("close", code => {
          logr.info(`Storage prep script exited with code ${code}`);
          return resolve();
        });

        child.stderr.on("data", function(data) {
          logr.warn(data.toString());
          //logr.error("Error while trying to wipe and mount persistent storage!");
          //logr.error(JSON.stringify(data, null, 2));
          //process.exit(1);
          //return reject();
        });
      });
    })

    // Build the Docker container.
    .then(() => {
      logr.log("Building Docker Image.");

      return execa("./lib/buildImage", undefined, execaOptions)
        .then(result => {
          //debugger;
          console.log(result.stdout);
        })
        .catch(err => {
          debugger;
          console.error("Error while trying to build Docker image!", err);
          logr.error("Error while trying to build Docker image!", err);
          logr.error(JSON.stringify(err, null, 2));
          process.exit(1);
        });
    })

    // Run the Docker container
    .then(() => {
      logr.log("Running the Docker image.");

      return execa("./lib/runImage", undefined, execaOptions)
        .then(result => {
          //debugger;
          logr.log(result.stdout);
        })
        .catch(err => {
          debugger;
          logr.error("Error while trying to run Docker image!");
          logr.error(JSON.stringify(err, null, 2));
          process.exit(1);
        });
    })

    .then(() => {
      logr.log("Docker image has been built and is running.");

      // Begin timer to check expiration.
      p2pVpsServer.startExpirationTimer(registerDevice);
    })

    .catch(err => {
      logr.error("Error in main program: ", err);
      process.exit(1);
    });
}
registerDevice();
