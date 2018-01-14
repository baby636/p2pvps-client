# VM Flash Storage VPS Client
This version of the VM client evolved from the simple-shell. Unlike that shell,
it provides persistent storage and sudo privileges. It's modeled after the
flash-shell client developed for the Raspberry Pi.

## Installation
To prepare you device for the P2P VPS marketplace
with this shell, run the following commands.
()[Source](http://www.walkernews.net/2007/07/01/create-linux-loopback-file-system-on-disk-file/))

1. Follow steps 1 through 9 for the [simple client](../simple), then enter the home
directory:

`cd`

2. Create a new mount point with this command:

`sudo mkdir /media/storage`

* Create a block device, which will become the persistent storage folder inside the
Docker container. The command below creates a 64GB file with 1MB blocks. Adjust
it for your needs:

`dd if=/dev/zero of=vps-storage bs=1M count=64000`

* Allow Linux to access the file as if it was a file system with this command:

`sudo losetup /dev/loop0 vps-storage`

* Format the new drive:

`sudo mkfs.ext4 /dev/loop0`

* Release the loopback device now that the file has been prepared:

`sudo losetup -d /dev/loop0`

7. Enter the flash-storage directory:

`cd node/p2pvps-client/client/vm/flash-storage`

8. Get your device GUID from the P2P VPS marketplace. This is provided in
the *Owned Devices view* by clicking the *+Add New Device* button. Paste this GUID into the `device-config.json` file.

9. Launch the simple client. The first time will take a while as it will need to download and
build several Docker containers:

`node p2p-vps-client.js`

That's it! Once the application presents the message `Docker image has been built and is running.`,
your device is now connected to the P2P VPS server and listed on the market for rent.

10. If you've successfully gotten this far, the next step is to get the software to
start on bootup. First, stop the programs you just started by hitting Ctrl-C. Then stop
the Docker container with `docker stop flash-shell`

11. Install PM2 with the command:

`sudo npm install -g pm2`

12. Start the P2P VPS client with this command:

`pm2 start p2p-vps-client.js`

13. Finally, save the process with this command:

`sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u pi --hp /home/pi`

and save the state of PM2 with this command:

`npm save`
