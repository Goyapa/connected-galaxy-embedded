// This file was a first try of the Meteor DDP client module
// DDP client connect to meteor server and was later used in index.js
"use strict";

// ngrok: Secure tunnels to localhost
// on server side start ngrok with: ./ngrok http 3000
// and change line 29

var DDPClient = require("ddp");

var ddpclient = new DDPClient({
  // All properties optional, defaults shown
//  host : "localhost",
//  port : 3000,
  ssl  : false,
  autoReconnect : true,
  autoReconnectTimer : 500,
  maintainCollections : true,
  ddpVersion : "1",  // ["1", "pre2", "pre1"] available,
  // uses the sockJs protocol to create the connection
  // this still uses websockets, but allows to get the benefits
  // from projects like meteorhacks:cluster
  // (load balancing and service discovery)
  // do not use `path` option when you are using useSockJs
  useSockJs: false,
  // Use a full url instead of a set of `host`, `port` and `ssl`
  // do not set `useSockJs` option if `url` is used
//  url: 'wss://example.com/websocket'
  url: 'ws://192cebf5.ngrok.io/websocket'
});

/*
 * Connect to the Meteor Server
 */
ddpclient.connect(function(error, wasReconnect) {
  // If autoReconnect is true, this callback will be invoked each time
  // a server connection is re-established
  if (error) {
    console.log("DDP connection error!");
    return;
  }

  if (wasReconnect) {
    console.log("Reestablishment of a connection.");
  }

  console.log("connected!");


  /*
   * Subscribe to a Meteor Collection
   */
  ddpclient.subscribe(
    "tasks",                  // name of Meteor Publish function to subscribe to
    [],                       // any parameters used by the Publish function
    function () {             // callback when the subscription is complete
      console.log("tasks complete:");
      console.log(ddpclient.collections.tasks);
    }
  );

  ddpclient.call('tasks.insert',["Hello Moon!"]);

  ddpclient.subscribe(
    "accelerometer",                  // name of Meteor Publish function to subscribe to
    [],                       // any parameters used by the Publish function
    function () {             // callback when the subscription is complete
      console.log("accelerometer complete:");
      console.log(ddpclient.collections.accelerometer);
    }
  );


  ddpclient.call('accelerometer.insert',["G is 4"]);


});

/*
 * Useful for debugging and learning the ddp protocol
 */
ddpclient.on('message', function (msg) {
  console.log("ddp message: " + msg);
});

ddpclient.on('socket-error', function(error) {
  console.log("Error: %j", error);
});
