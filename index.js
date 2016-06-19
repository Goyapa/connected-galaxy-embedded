"use strict";
// Todo: Setup Meteor App install DDP and establish first connetion.
// and config https://www.npmjs.com/package/config

// ngrok: Secure tunnels to localhost
// ngrok start with: ./ngrok http 3000
// and change line 27

var raspi = require('raspi-io');
var five = require('johnny-five'),board, nunchuk;
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

    //ddpclient.call('tasks.insert',["Hello Moon!"]);

    ddpclient.subscribe(
      "accelerometer",                  // name of Meteor Publish function to subscribe to
      [],                       // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        console.log("accelerometer complete:");
        console.log(ddpclient.collections.accelerometer);
      }
    );



    ddpclient.call('tasks.insert',["Hello Moon task!"]);


  });


var board = new five.Board({
  io: new raspi()
});

board.on('ready', function() {

// When using the WiiChuck adapter with an UNO,
  // these pins act as the Ground and Power lines.
  // This will not work on a Leonardo, so these
  // lines can be removed.
//  new five.Pin("A2").low();
//  new five.Pin("A3").high();

  // Create a new `nunchuk` hardware instance.
  nunchuk = new five.Wii.Nunchuk({
    freq: 50
  });


  // Nunchuk Event API
  //

  // "read" (nunchuk)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  // nunchuk.on( "read", function( err ) {

  // });

  // "change", "axischange" (joystick)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  nunchuk.joystick.on("change", function(event) {
    console.log(
      "joystick " + event.axis,
      event.target[event.axis],
      event.axis, event.direction
    );

  });

  // "change", "axischange" (accelerometer)
  //
  // Fired when the accelerometer detects a change in
  // axis position.
  //
  nunchuk.accelerometer.on("change", function(event) {
    console.log(
      "accelerometer " + event.axis,
      event.target[event.axis],
      event.axis, event.direction
    );

    ddpclient.call('accelerometer.insert',[{
      value : event.target[event.axis],
      axis : event.axis,
      direction : event.direction
    }], (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('success send accelerometer data')
        // success!
      }
    });

  });

  // "down"
  // aliases: "press", "tap", "impact", "hit"
  //
  // Fired when any nunchuk button is "down"
  //

  // "up"
  // alias: "release"
  //
  // Fired when any nunchuk button is "up"
  //

  // "hold"
  //
  // Fired when any nunchuk button is in the "down" state for
  // a specified amount of time. Defaults to 500ms
  //
  // To specify a custom hold time, use the "holdtime"
  // option of the Nunchuk constructor.
  //


  ["down", "up", "hold"].forEach(function(type) {

    nunchuk.on(type, function(event) {
      console.log(
        event.target.which + " is " + type,

        {
          isUp: event.target.isUp,
          isDown: event.target.isDown
        }
      );
    });

  });


  // Further reading
  // http://media.pragprog.com/titles/msard/tinker.pdf
  // http://lizarum.com/assignments/physical_computing/2008/wii_nunchuck.html

});
