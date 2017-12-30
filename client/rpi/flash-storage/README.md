# Renter Shell with Flash Storage
The code in this directory allow device Owners to create a Renter shell with
persistent storage. Also, unlike the [simple shell](../simple), the Renter has
sudo privileges in this flash shell. *However, it is much easier to debug issues if
you build the [simple shell](../simple) **before** building this client.*

It is **strongly** recommended that device
owners do not use the SD card for persistent storage, and instead use a dedicated
USB flash drive. The scripts in this directory assume this configuration.
Reliable **64 GB** flash drives can now be found on [Amazon.com](http://amzn.to/2CZq2eR)
for under $15. This capacity will be considered the 'standard' storage size for a P2P VPS client.

![flash client](../../../images/flash-client.jpg?raw=true "flash client")


## Installation
To prepare you device for the P2P VPS marketplace
with this shell, run the following commands:

1. Follow steps 1 through 11 for the [simple client](../simple).

2. Create a new mount point with this command:

`sudo mkdir /media/usb`

3. By default, flash drives plugged into the Raspberry Pi's USB port are identified
as */dev/sda1* by the operating system. Run the following command and note the
`PARTUUID` value:

`sudo blkid`

output: */dev/sda1: UUID="8dd06116-a29c-459f-9002-c1cccd7892d5" TYPE="ext4" **PARTUUID="eb5e7935-01"***

4. Add the following line to `/etc/fstab` with the command `sudo nano /etc/fstab`. Replace
`eb5e7935-01` with the value from your own device.
Note: You can brick your RPi if this line is malformed. This would require re-loading NOOBS.

`PARTUUID=eb5e7935-01 /media/usb ext4 defaults 0 0`

5. Reboot the RPi. When the device reboots, the flash drive will automatically be mounted
to `/media/usb`.

6. Prepare the USB flash drive for use by formatting and mounting it.
Ensure you are in the `p2pvps-client/client/rpi/flash-storage` directory.
Run the flash preparation script with this command:

`./lib/prep-flash-storage`

7. Install library dependencies with this command:

`npm install`

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
