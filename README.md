pushnot
=======

Thai's push notification server written in Node.js. A combination of:

* [zephyros][] for alerts and [node-zephyros][] for a promise-based Node.js interface.
* [express][] for building HTTP API.
* [ursa][] for encrypting the Notification text.
* [zeromq][] and [zeromq.node][] for pubsub server.
* [leveldb][] and [node-levelup][] for local database.
* [growl][] and [node-growl][] for another notification system.

Components
----------

It consists of several components:


### The Server

* lets the client send a notification to the server
* publish the latest notification ID through a zeromq pubsub socket.
* lets subscribers get the notification data through an HTTP api.


### The Client

* encrypts the notification message and post it to the server


### The CLI

* a command line interface to the client.
  lets user type `pushnot app_name message` to send a push notification,
  for use in shell scripts.


### The Subscriber

* a zephyros script that subscribes to new notification messages
  and display an alers.


[zephyros]: https://github.com/sdegutis/zephyros
[node-zephyros]: https://github.com/danielepolencic/node-zephyros
[express]: http://expressjs.com/
[ursa]: https://github.com/Obvious/ursa
[zeromq]: http://zeromq.org/
[zeromq.node]: https://github.com/JustinTulloss/zeromq.node
[leveldb]: http://code.google.com/p/leveldb/
[levelup]: https://github.com/rvagg/node-levelup
[growl]: http://growl.info/
[node-growl]: https://github.com/visionmedia/node-growl

