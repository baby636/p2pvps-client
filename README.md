# P2P VPS - Client

## What is P2P VPS?
P2P VPS aspires to create a peer-to-peer (P2P) marketplace offering Virtual Private Servers (VPS), similar to
[Digital Ocean](http://digitalocean.com) or [Vultr](http://vultr.com). This would also be similar
to co-location services like [Raspberry Pi Hosting](https://raspberry-hosting.com/en) or
[Mythic Beasts](https://www.mythic-beasts.com/order/rpi).
However, instead of using a data center,
the marketplace would use an array of pseudo-anonymous IoT devices (like the [Raspberry Pi](https://www.raspberrypi.org/))
hosted by people participating in the marketplace. Anyone
with an internet connection and a device capable of running [Docker](https://www.docker.com/) can rent
that device in the P2P VPS marketplace.

While [the applications of such a network](https://raspberry-hosting.com/en/applications) are similar,
the P2P VPS marketplace will never have the speed or reliability of the commercial outfits linked above.
Instead, the focus of P2P VPS is to create a decentralized network of anonymous web servers,
capable of delivering websites or web apps, in order to prevent censorship and promote free speech.

Members participating in the marketplace can earn cryptocurrency by renting out their device, while
helping to create a more decentralized internet at the same time.
That's the focus of the P2P VPS network. In this way, the P2P VPS software is censorship-fighting
software similar to, but very different from, [TOR](https://www.torproject.org/).

Find out more at the [P2P VPS Homepage](http://p2pvps.org).

## About This Repository
This repository is the *client-side* software needed to turn a computer into a VPS.
By 'computer' we mean any computer. An old laptop, a Virtual Machine (VM) running on a desktop,
or even an Internet of Things (IoT) device like a Raspberry Pi. Any computer capable of running Docker.
The P2P VPS software is composed of three software packages:

1. *The Client* software runs on any computer and allows the device to be rented on the marketplace.
2. *The Server* software includes the database models, REST APIs, website content, and Vue.js marketplace app.
3. *Server Deployment* is a collection of Docker containers orchestrated with Docker Compose.

This repository contains **The Client**.

## Installation

* This repository currently focuses on two versions of the client: One targets the
[Raspberry Pi](client/rpi).
The other targets Ubuntu 16.04 environment running in a [VirtualBox VM](client/vm).

* Each version of the Client has secondary versions. The *simple client* is the simplest
possible client. You should install this client first before moving on to the more complex
*flash client*. The flash client build on top of the simple client by adding sudo privileges
and persistent storage.

* Installation Instructions:
  * [Raspberry Pi simple-client](client/rpi/simple)
  * [Raspberry Pi flash-client](client/rpi/flash-storage)
  * [VM simple-client](client/vm/simple)
  * [VM flash-client](flash-storage)

### File Layout
* The `client` directory contains various implementations of the P2P VPS Client code:

  * The `simple` directory creates the simplest client Docker container. It will set up a reverse SSH connection
  with no persistent storage and the user will not have sudo privileges. It's the simplest, most limited, way
  to create a VPS that can be rented out on P2P VPS. This client is primarily used for testing.

  * the `flash-storage` directory creates a more comples Client by adding sudo privileges and persistant storage.

## License
(The MIT License)

Copyright (c) 2017 [Chris Troutner](http://christroutner.com) and [RPiOVN](http://rpiovn.org)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
