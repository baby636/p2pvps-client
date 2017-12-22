# Simple VPS
This is the simplest possible implementation of a Virtual Private Server (VPS). It spins up
a Raspbian-based Docker container with SSH shell access. There is no persistent storage,
so everything is held in memory and deleted if the device is rebooted. The SSH user also
does not have sudo privileges so is pretty strongly restricted in what they can do.

However, by keeping it simple, this client is preferred for testing. If you're a beginner at
setting up a P2P VPS client, you should start by following the directions below.

## Installation
These instructions assume you are starting with a Raspberry Pi v3 B+ with an 8GB or larger
SD card. It also assumes that you are starting with a fresh install of Raspbian OS, which can be
[installed via NOOBS](https://www.raspberrypi.org/documentation/installation/noobs.md).

It will take an hour or two for the Raspberry Pi to execute all the instructions in this
document. If you are provisioning several Pi's for use on the P2P VPS network, it's much
faster to copy the SD card image after completing setup on the first device. The built-in
[SD card copier](https://www.raspberrypi.org/blog/another-update-raspbian/) feature in
Raspbian is the easiest way to do this. Unfortunately, there is no command-line version
of that application.

### Device Configuration

1. After installing Raspbian, you need to
[enable SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/) and ensure you can
connect to your RPi over your local area network using SSH. I prefer to use
[Putty](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) as my SSH terminal on
Windows. It's light weight and powerful.

2. The first thing to do after logging into the Raspberry Pi is change the default password.
From the SSH command line terminal, issue the command `passwd` and change the default password
for the user `pi`.

3. (optional) A fresh install of Raspbian on an 8GB card does not leave much room.
If you plan to designate this device as a dedicated VPS, it will be advantageous
to remove a lot of unneeded software.
Follow the commands below to update your device and remove unneeded software.

```
sudo apt-get --purge -y remove libreoffice libreoffice-avmedia-backend-gstreamer libreoffice-base libreoffice-base-core libreoffice-base-drivers libreoffice-calc libreoffice-common libreoffice-core libreoffice-draw libreoffice-gtk libreoffice-impress libreoffice-java-common libreoffice-math libreoffice-report-builder-bin libreoffice-sdbc-hsqldb libreoffice-style-galaxy libreoffice-writer bluej wolfram-engine scratch geany geany-common greenfoot sonic-pi

sudo apt-get --purge -y remove minecraft-pi chromium-browser

sudo apt-get -y autoremove
```

4. This is a great time to update the software on the device, including any security patches.
```
sudo apt-get -y update

sudo apt-get -y remove nodejs
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

sudo apt-get -y upgrade
```

5. (optional) For renting out as a VPS, I usually hard connect the RPi with an ethernet cord. That
means I can disable to the WiFi and Bluetooth to reduce power, save money, and prevent an attack
vector. It's easy to disable by adding these two lines to the bottom of `/boot/config.txt`:
```
dtoverlay=pi3-disable-wifi
pi3-disable-bt
```

6. You'll also need to install Docker on the RPi. Prior to running the instructions below,
this is a great time to reboot your device. It seems to prevent errors with installing Docker.

`curl -sSL https://get.docker.com | sh`

7. Follow the on-screen instructions to add the user 'pi' to the docker group.
You'll need to open a new terminal after entering this instruction:

`sudo usermod -aG docker pi`

8. Now, downgrade Docker (until they fix issues with the newer versions):

`sudo apt install docker-ce=17.09.0~ce-0~raspbian`

9. (optional) create a directory for your node applications, like this one:

`mkdir node`

10. Clone this repository:

`git clone https://github.com/P2PVPS/p2pvps-client`

11. Setup the Client program by running:
```
cd p2pvps-client
npm install
```

12. Change into the RPi simple client directory:

`cd client/rpi/simple/`

13. Install the dependencies:

`npm install`

14. Get your device GUID from the P2P VPS marketplace. This is provided in
the *Owned Devices view* by clicking the *+Add New Device* button. Paste this GUID into the `device-config.json` file.

15. Launch the simple client. The first time will take a while as it will need to download and
build several Docker containers:

`node p2p-vps-client.js`

That's it! Once the application presents the message `Docker image has been built and is running.`,
your device is now connected to the P2P VPS server and listed on the market for rent.
