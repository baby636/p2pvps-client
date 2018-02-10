# Simple VPS Client
This is the simplest possible implementation of a Virtual Private Server (VPS). It spins up
a Ubuntu-based Docker container with SSH shell access. There is no persistent storage,
so everything is held in memory and deleted if the device is rebooted. The SSH user also
does not have sudo privileges, so they're strongly restricted in what they can do.

However, by keeping it simple, this client is preferred for testing. If you're a beginner at
setting up a P2P VPS client, you should start by following the directions below.


## Installation
These instructions assume you are starting with a fresh installation of Ubuntu 16.04 or newer.

You will also need to register an account at: https://p2pvps.net/createaccount

**Note** this is where you will get the device GUID mentioned in step 9 below.


### Device Configuration

1. This is a great time to update the software on the device, including any security patches.
```
sudo apt-get -y update

sudo apt-get -y upgrade
```

2. This installation also assumes you are using node v8 or higher. You can install it with:
```
sudo apt-get -y remove nodejs
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
```

3. You'll also need to install Docker. Prior to running the instructions below,
this is a great time to reboot your device. It seems to prevent occasional errors
with installing Docker.

`curl -sSL https://get.docker.com | sh`

4. Follow the on-screen instructions to add your user to the docker group.
You'll need to open a new terminal after entering this instruction:

`sudo usermod -aG docker $USER`

5. (optional) create a directory for your node applications, like this:
```
mkdir node
cd node
```

6. Clone this repository:

`git clone https://github.com/P2PVPS/p2pvps-client`

7. Setup the Client libraries by running:
```
cd p2pvps-client/client
npm install
```

8. Change into the VM simple client directory:

`cd vm/simple/`

9. Get your device GUID from the P2P VPS marketplace. This is provided in
the *Owned Devices view* by clicking the *+Add New Device* button. Paste this GUID into the `device-config.json` file.

10. Launch the simple client. The first time will take a while as it will need to download and
build several Docker containers:

`sudo node p2p-vps-client.js`

That's it! Once the application presents the message `Docker image has been built and is running.`,
your device is now connected to the P2P VPS server and listed on the market for rent.
