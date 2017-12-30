/*
 * Copyright 2017 Chris Troutner & P2PVPS.org
 * Licensing Information: MIT License
 *
 * This program writes out the Dockerfile and various configuration files.
 */

"use strict";

const fs = require("fs");

class WriteFiles {
  constructor(deviceConfig) {
    this.port = "";
    this.username = "";
    this.password = "";
    this.deviceId = deviceConfig.deviceId;
    this.serverIp = deviceConfig.serverIp;
    this.serverPort = deviceConfig.serverPort;
    this.sshServer = deviceConfig.sshServer;
    this.sshServerPort = deviceConfig.sshServerPort;
  }

  // This function writes out the Dockerfile.
  writeDockerfile(port, username, password) {
    this.port = port;
    this.username = username;
    this.password = password;

    return new Promise((resolve, reject) => {
      const fileString = `FROM ubuntu:17.04
MAINTAINER Chris Troutner <chris.troutner@gmail.com>
RUN apt-get -y update
RUN apt-get install -y openssh-server
RUN apt-get install -y nano
RUN apt-get install -y ssh
RUN mkdir /var/run/sshd
RUN sed 's@sessions*requireds*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd
ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
WORKDIR /root
VOLUME /usr/src/app/logs
COPY package.json package.json
RUN npm install
EXPOSE 3100
COPY dummyapp.js dummyapp.js
COPY finalsetup finalsetup
COPY connect-client.js connect-client.js
COPY package.json package.json
COPY config.json config.json
RUN chmod 775 finalsetup
VOLUME /media/storage
RUN chown -R ${username} /media/storage
RUN adduser ${username} sudo
RUN useradd -ms /bin/bash ${this.username}
RUN echo ${this.username}:${this.password} | chpasswd
EXPOSE ${this.port}
#ENTRYPOINT [\"./finalsetup\", \"node\", \"dummyapp.js\"]
ENTRYPOINT ["./finalsetup", "node", "connect-client.js"]
`;

      fs.writeFile("./output-files/Dockerfile", fileString, function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write file: ", err);
          reject(err);
        } else {
          console.log("Dockerfile written successfully!");
          resolve();
        }
      });
    });
  }

  // writeClientConfig writes out the config.json file.
  writeClientConfig() {
    //debugger;

    return new Promise((resolve, reject) => {
      const fileJSON = {
        deviceId: this.deviceId,
        serverIp: this.serverIp,
        serverPort: this.serverPort,
        sshServer: this.sshServer,
        sshServerPort: this.sshServerPort,
        sshTunnelPort: this.port,
      };

      fs.writeFile("./output-files/config.json", JSON.stringify(fileJSON, null, 2), function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write config.json file: ", err);
          reject(err);
        } else {
          console.log("config.json written successfully!");
          resolve();
        }
      });
    });
  }
}

module.exports = WriteFiles;
