# Renter Shell with Flash Storage
The code in this directory allow device Owners to create a Renter shell with
persistent storage. Also, unlike the [simple shell](../simple), the Renter has
sudo privileges in this flash shell. *However, it is much easier to debug issues if
you build the [simple shell](../simple) **before** building this client.*

It is **strongly** recommended that device
owners do not use the SD card for persistent storage, and instead use a dedicated
USB flash drive. The scripts in this directory assume this configuration.
Reliable **64 GB** flash drives can now be found on [Amazon.com](http://amzn.to/2CZq2eR)
for under $15. This capacity will be considered the 'standard' storage side for a P2P VPS client.

![flash client](../../../images/flash-client.jpg?raw=true "flash client")

To prepare you device for the P2P VPS marketplace
with this shell, run the following commands:

1. First, prepare the USB flash drive for use by formatting and mounting it. Run the script `./prepFlashStorage`

2. Update the `deviceGUID.json` file with the GUID provided by the P2P VPS Marketplace. The easiest way
to edit file is with `nano deviceGUID.json`.

3. Register the device with the P2P VPS server by running `node registerDevice.js`

4. Build the Docker container the Renter will use with `./buildImage`

5. After the image has finished building, run the container with `./runImage`.

Done! Your device is now setup to accept renters. From here you can enter it into the P2P VPS Marketplace on p2pvps.net.

To prepare your device for a new renter, bring down the Docker container with the command `docker stop flash-shell`.
After that completes, start over with step 1.
