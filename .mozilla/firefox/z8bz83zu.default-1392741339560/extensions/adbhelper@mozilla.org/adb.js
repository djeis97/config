/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Wrapper around the ADB utility.

'use strict';

// Whether or not this script is being loaded as a CommonJS module
// (from an addon built using the Add-on SDK).  If it isn't a CommonJS Module,
// then it's a JavaScript Module.

const { Cc, Ci, Cu, Cr } = require("chrome");
const subprocess = require("./subprocess");
const file = require("sdk/io/file");
const {env} = require("sdk/system/environment");
const events = require("sdk/event/core");
const {XPCOMABI} = require("sdk/system/runtime");
const {setTimeout} = require("sdk/timers");

Cu.import("resource://gre/modules/Services.jsm");

// When loaded as a CommonJS module, get the TextEncoder and TextDecoder
// interfaces from the Services JavaScript Module, since they aren't defined
// in a CommonJS module by default.
let { TextEncoder, TextDecoder } =
  Cu.import("resource://gre/modules/Services.jsm", {});

let promise;
try {
  promise = Cu.import("resource://gre/modules/commonjs/promise/core.js").Promise;
} catch (e) {
  promise = Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js").Promise;
}
Cu.import("resource://gre/modules/osfile.jsm");

// Workaround until bug 920586 is fixed
// in order to allow TCPSocket usage in chrome code
// without exposing it to content
function createTCPSocket() {
  let scope = Cu.Sandbox(Services.scriptSecurityManager.getSystemPrincipal());
  scope.DOMError = Cu.import('resource://gre/modules/Services.jsm').DOMError;
  Services.scriptloader.loadSubScript("resource://gre/components/TCPSocket.js", scope);
  scope.TCPSocket.prototype.initWindowless = function () true;
  return new scope.TCPSocket();
}

let ready = false;
let didRunInitially = false;
const psRegexNix = /.*? \d+ .*? .*? \d+\s+\d+ .*? .*? .*? .*? adb .*fork\-server/;
const psRegexWin = /adb.exe.*/;

const OKAY = 0x59414b4f;
const FAIL = 0x4c494146;
const STAT = 0x54415453;
const DATA = 0x41544144;
const DONE = 0x454e4f44;

const ADB = {
  get didRunInitially() didRunInitially,
  set didRunInitially(newVal) { didRunInitially = newVal },
  get ready() ready,
  set ready(newVal) { ready = newVal },

  init: function adb_init() {
    console.log("init");
    let platform = Services.appinfo.OS;

    let uri = "resource://adbhelperatmozilla.org/";

    let bin;
    switch(platform) {
      case "Linux":
        let platform = XPCOMABI.indexOf("x86_64") == 0 ? "linux64" : "linux";
        bin = uri + platform + "/adb";
        break;
      case "Darwin":
        bin = uri + "mac64/adb";
        break;
      case "WINNT":
        bin = uri + "win32/adb.exe";
        break;
      default:
        console.log("Unsupported platform : " + platform);
        return;
    }

    let url = Services.io.newURI(bin, null, null)
                      .QueryInterface(Ci.nsIFileURL);
    this._adb = url.file;
  },

  // We startup by launching adb in server mode, and setting
  // the tcp socket preference to |true|
  start: function adb_start() {
    let deferred = promise.defer();
    
    let onSuccessfulStart = (function onSuccessfulStart() {
      Services.obs.notifyObservers(null, "adb-ready", null);
      this.ready = true;
      deferred.resolve();
    }).bind(this);

    require("./adb-running-checker").check().then((function(isAdbRunning) {
        if (isAdbRunning) {
          this.didRunInitially = false;
          console.log("Found ADB process running, not restarting");
          onSuccessfulStart();
          return;
        }
        console.log("Didn't find ADB process running, restarting");

        this.didRunInitially = true;
        let process = Cc["@mozilla.org/process/util;1"]
                        .createInstance(Ci.nsIProcess);
        process.init(this._adb);
        let params = ["start-server"];
        let self = this;
        process.runAsync(params, params.length, {
          observe: function(aSubject, aTopic, aData) {
            switch(aTopic) {
              case "process-finished":
                onSuccessfulStart();
                break;
              case "process-failed":
                self.ready = false;
                deferred.reject();
                break;
             }
           }
        }, false);
      }).bind(this));

    return deferred.promise;
  },

  /**
   * Stop the ADB server, but only if we started it.  If it was started before
   * us, we return immediately.
   *
   * @param boolean sync
   *        In case, we do need to kill the server, this param is passed through
   *        to kill to determine whether it's a sync operation.
   */
  stop: function(sync) {
    if (!this.didRunInitially) {
      return; // We didn't start the server, nothing to do
    }
    this.kill(sync);
  },

  /**
   * Kill the ADB server.  We do this by running ADB again, passing it
   * the "kill-server" argument.
   *
   * @param {Boolean} aSync
   *        Whether or not to kill the server synchronously.  In general,
   *        this should be false.  But on Windows, an addon may fail to update
   *        if its copy of ADB is running when Firefox tries to update it.
   *        So addons who observe their own updates and kill the ADB server
   *        beforehand should do so synchronously on Windows to make sure
   *        the update doesn't race the killing.
   */
  kill: function adb_kill(aSync) {
    let process = Cc["@mozilla.org/process/util;1"]
                    .createInstance(Ci.nsIProcess);
    process.init(this._adb);
    let params = ["kill-server"];

    if (aSync) {
      process.run(true, params, params.length);
      console.log("adb kill-server: " + process.exitValue);
      this.ready = false;
      this.didRunInitially = false;
    }
    else {
      let self = this;
      process.runAsync(params, params.length, {
        observe: function(aSubject, aTopic, aData) {
          switch(aTopic) {
            case "process-finished":
              console.log("adb kill-server: " + process.exitValue);
              Services.obs.notifyObservers(null, "adb-killed", null);
              self.ready = false;
              self.didRunInitially = false;
              break;
            case "process-failed":
              console.log("adb kill-server failure: " + process.exitValue);
              // It's hard to say whether or not ADB is ready at this point,
              // but it seems safer to assume that it isn't, so code that wants
              // to use it later will try to restart it.
              Services.obs.notifyObservers(null, "adb-killed", null);
              self.ready = false;
              self.didRunInitially = false;
              break;
          }
        }
      }, false);
    }
  },

  _isAdbRunning: function() {
    let deferred = promise.defer();

    let ps, args;
    let platform = Services.appinfo.OS;
    if (platform === "WINNT") {
      ps = "C:\\windows\\system32\\tasklist.exe";
      args = [];
    } else {
      args = ["aux"];
      let psCommand = "ps";

      let paths = env.PATH.split(':');
      let len = paths.length;
      for (let i = 0; i < len; i++) {
        try {
          let fullyQualified = file.join(paths[i], psCommand);
          if (file.exists(fullyQualified)) {
            ps = fullyQualified;
            break;
          }
        } catch (e) {
          // keep checking PATH if we run into NS_ERROR_FILE_UNRECOGNIZED_PATH
        }
      }
      if (!ps) {
        console.log("Error: a task list executable not found on filesystem");
        deferred.resolve(false); // default to restart adb
        return deferred.promise;
      }
    }

    let buffer = [];

    subprocess.call({
      command: ps,
      arguments: args,
      stdout: function(data) {
        buffer.push(data);
      },
      done: function() {
        let lines = buffer.join('').split('\n');
        let regex = (platform === "WINNT") ? psRegexWin : psRegexNix;
        let isAdbRunning = lines.some(function(line) {
          return regex.test(line);
        });
        deferred.resolve(isAdbRunning);
      }
    });

    return deferred.promise;
  },

  // Creates a socket connected to the adb instance.
  // This function is sync, and returns before we know if opening the
  // connection succeeds. Callers must attach handlers to the socket.
  _connect: function adb_connect() {
    let TCPSocket = createTCPSocket();
    let socket = TCPSocket.open(
     "127.0.0.1", 5037,
     { binaryType: "arraybuffer" });
    return socket;
  },

  // @param aCommand A protocol-level command as described in
  //  http://androidxref.com/4.0.4/xref/system/core/adb/OVERVIEW.TXT and
  //  http://androidxref.com/4.0.4/xref/system/core/adb/SERVICES.TXT
  // @return A 8 bit typed array.
  _createRequest: function adb_createRequest(aCommand) {
    let length = aCommand.length.toString(16).toUpperCase();
    while(length.length < 4) {
      length = "0" + length;
    }

    let encoder = new TextEncoder();
    return encoder.encode(length + aCommand);
  },

  // Checks if the response is expected.
  // @return true if response equals expected.
  _checkResponse: function adb_checkResponse(aPacket, expected) {
    let buffer = aPacket;
    let view = new Uint32Array(buffer, 0 , 1);
    if (view[0] == FAIL) {
      console.log("Response: FAIL");
    }
    return view[0] == expected;
  },

  // @param aPacket         The packet to get the length from.
  // @param aIgnoreResponse True if this packet has no OKAY/FAIL.
  // @return                A js object { length:...; data:... }
  _unpackPacket: function adb_unpackPacket(aPacket, aIgnoreResponse) {
    let buffer = aPacket;
    let lengthView = new Uint8Array(buffer, aIgnoreResponse ? 0 : 4, 4);
    let decoder = new TextDecoder();
    let length = parseInt(decoder.decode(lengthView), 16);
    let text = new Uint8Array(buffer, aIgnoreResponse ? 4 : 8, length);
    return { length: length, data: decoder.decode(text) }
  },

  // Start tracking devices connecting and disconnecting from the host.
  // We can't reuse runCommand here because we keep the socket alive.
  // @return The socket used.
  trackDevices: function adb_trackDevices() {
    console.log("trackDevices");
    let socket = this._connect();
    let waitForFirst = true;
    let devices = {};

    socket.onopen = function() {
      console.log("trackDevices onopen");
      Services.obs.notifyObservers(null, "adb-track-devices-start", null);
      let req = this._createRequest("host:track-devices");
      ADB.sockSend(socket, req);

    }.bind(this);

    socket.onerror = function(event) {
      console.log("trackDevices onerror: " + event.data.name);
      Services.obs.notifyObservers(null, "adb-track-devices-stop", null);
    }

    socket.onclose = function() {
      console.log("trackDevices onclose");

      // Report all devices as disconnected
      for (let dev in devices) {
        devices[dev] = false;
        events.emit(ADB, "device-disconnected", dev);
      }

      Services.obs.notifyObservers(null, "adb-track-devices-stop", null);

      // When we lose connection to the server,
      // and the adb is still on, we most likely got our server killed
      // by local adb. So we do try to reconnect to it.
      setTimeout(function () { // Give some time to the new adb to start
        if (ADB.ready) { // Only try to reconnect/restart if the addon is still enabled
          ADB.start().then(function () { // try to connect to the new local adb server
                                         // or, spawn a new one
            ADB.trackDevices(); // Re-track devices
          });
        }
      }, 2000);
    }

    socket.ondata = function(aEvent) {
      console.log("trackDevices ondata");
      let data = aEvent.data;
      console.log("length=" + data.byteLength);
      let dec = new TextDecoder();
      console.log(dec.decode(new Uint8Array(data)).trim());

      // check the OKAY or FAIL on first packet.
      if (waitForFirst) {
        if (!this._checkResponse(data, OKAY)) {
          socket.close();
          return;
        }
      }

      let packet = this._unpackPacket(data, !waitForFirst);
      waitForFirst = false;

      if (packet.data == "") {
        // All devices got disconnected.
        for (let dev in devices) {
          devices[dev] = false;
          events.emit(ADB, "device-disconnected", dev);
        }
      } else {
        // One line per device, each line being $DEVICE\t(offline|device)
        let lines = packet.data.split("\n");
        let newDev = {};
        lines.forEach(function(aLine) {
          if (aLine.length == 0) {
            return;
          }

          let [dev, status] = aLine.split("\t");
          newDev[dev] = status !== "offline";
        });
        // Check which device changed state.
        for (let dev in newDev) {
          if (devices[dev] != newDev[dev]) {
            if (dev in devices || newDev[dev]) {
              let topic = newDev[dev] ? "device-connected"
                                      : "device-disconnected";
              events.emit(ADB, topic, dev);
            }
            devices[dev] = newDev[dev];
          }
        }
      }
    }.bind(this);

    return socket;
  },

  // Sends back an array of device names.
  listDevices: function adb_listDevices() {
    console.log("listDevices");

    return this.runCommand("host:devices").then(
      function onSuccess(data) {
        let lines = data.split("\n");
        let res = [];
        lines.forEach(function(aLine) {
          if (aLine.length == 0) {
            return;
          }
          let [device, status] = aLine.split("\t");
          res.push(device);
        });
        return res;
      }
    );
  },

  // sends adb forward aLocalPort aDevicePort
  forwardPort: function adb_forwardPort(aLocalPort, aDevicePort) {
    console.log("forwardPort " + aLocalPort + " -- " + aDevicePort);
    // <host-prefix>:forward:<local>;<remote>

    return this.runCommand("host:forward:" + aLocalPort + ";" + aDevicePort)
               .then(function onSuccess(data) {
                 return data;
               });
  },

  // Checks a file mode.
  // aWhat is one the strings "S_ISDIR" "S_ISCHR" "S_ISBLK"
  // "S_ISREG" "S_ISFIFO" "S_ISLNK" "S_ISSOCK"
  checkFileMode: function adb_checkFileMode(aMode, aWhat) {
    /* Encoding of the file mode.  See bits/stat.h */
    const S_IFMT = parseInt("170000", 8); /* These bits determine file type.  */

    /* File types.  */
    const S_IFDIR  = parseInt("040000", 8); /* Directory.  */
    const S_IFCHR  = parseInt("020000", 8); /* Character device.  */
    const S_IFBLK  = parseInt("060000", 8); /* Block device.  */
    const S_IFREG  = parseInt("100000", 8); /* Regular file.  */
    const S_IFIFO  = parseInt("010000", 8); /* FIFO.  */
    const S_IFLNK  = parseInt("120000", 8); /* Symbolic link.  */
    const S_IFSOCK = parseInt("140000", 8); /* Socket.  */

    let masks = {
      "S_ISDIR": S_IFDIR,
      "S_ISCHR": S_IFCHR,
      "S_ISBLK": S_IFBLK,
      "S_ISREG": S_IFREG,
      "S_ISFIFO": S_IFIFO,
      "S_ISLNK": S_ISLNK,
      "S_ISSOCK": S_IFSOCK
    }

    if (!(aWhat in masks)) {
      return false;
    }

    return ((aMode & S_IFMT) == masks[aWhat]);
  },

  // pulls a file from the device.
  // send "host:transport-any" why??
  // if !OKAY, return
  // send "sync:"
  // if !OKAY, return
  // send STAT + hex4(path.length) + path
  // recv STAT + 12 bytes (3 x 32 bits: mode, size, time)
  // send RECV + hex4(path.length) + path
  // while(needs data):
  //   recv DATA + hex4 + data
  // recv DONE + hex4(0)
  // send QUIT + hex4(0)
  pull: function adb_pull(aFrom, aDest) {
    let deferred = promise.defer();
    let socket;
    let state;
    let fileSize;
    let fileData;
    let remaining;
    let currentPos = 0;
    let chunkSize;
    let pkgData;
    let headerArray;
    let currentHeaderLength;

    let encoder = new TextEncoder();
    let view;
    let infoLengthPacket;

    console.log("pulling " + aFrom + " -> " + aDest);

    let shutdown = function() {
      console.log("pull shutdown");
      socket.close();
      deferred.reject("BAD_RESPONSE");
    }

    // extract chunk data header info. to headerArray.
    let extractChunkDataHeader = function(data) {
      let tmpArray = new Uint8Array(headerArray.buffer);
      for (let i = 0; i < 8 - currentHeaderLength; i++) {
        tmpArray[currentHeaderLength + i] = data[i];
      }
    }

    // chunk data header is 8 bytes length,
    // the first 4 bytes: hex4("DATA"), and
    // the second 4 bytes: hex4(chunk size)
    let checkChunkDataHeader = function(data) {
      if (data.length + currentHeaderLength >= 8) {
        extractChunkDataHeader(data);

        if (headerArray[0] != DATA) {
          shutdown();
          return false;
        }
        // remove header info. from socket package data
        pkgData = data.subarray(8 - currentHeaderLength, data.length);
        chunkSize = headerArray[1];
        currentHeaderLength = 0;
        return true;
      }

      // If chunk data header info. is separated into more than one
      // socket package, keep partial header info. in headerArray.
      let tmpArray = new Uint8Array(headerArray.buffer);
      for (let i = 0; i < data.length; i++) {
        tmpArray[currentHeaderLength + i] = data[i];
      }
      currentHeaderLength += data.length;
      return true;
    }

    // The last remaining package data contains 8 bytes,
    // they are "DONE(0x454e4f44)" and 0x0000.
    let checkDone = function(data) {
      if (remaining != 0 || data.length != 8) {
        return false;
      }

      let doneFlagArray = new Uint32Array(1);
      let tmpArray = new Uint8Array(doneFlagArray.buffer);
      for (let i = 0; i < 4; i++) {
        tmpArray[i] = data[i];
      }
      // Check DONE flag
      if (doneFlagArray[0] == DONE) {
        return true;
      }
      return false;
    }

    let runFSM = function runFSM(aData) {
      console.log("runFSM " + state);
      let req;
      switch(state) {
        case "start":
          state = "send-transport";
          runFSM();
          break;
        case "send-transport":
          req = ADB._createRequest("host:transport-any");
          ADB.sockSend(socket, req);
          state = "wait-transport";
          break;
        case "wait-transport":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          console.log("transport: OK");
          state = "send-sync";
          runFSM();
          break;
        case "send-sync":
          req = ADB._createRequest("sync:");
          ADB.sockSend(socket, req);
          state = "wait-sync";
          break;
        case "wait-sync":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          console.log("sync: OK");
          state = "send-stat";
          runFSM();
          break;
        case "send-stat":
          infoLengthPacket = new Uint32Array(1);
          infoLengthPacket[0] = aFrom.length;
          ADB.sockSend(socket, encoder.encode("STAT"));
          ADB.sockSend(socket, infoLengthPacket);
          ADB.sockSend(socket, encoder.encode(aFrom));

          state = "wait-stat";
          break;
        case "wait-stat":
          if (!ADB._checkResponse(aData, STAT)) {
            shutdown();
            return;
          }
          view = new Uint32Array(aData);
          // view contains 4 elements of 32 bit;
          // the first element is hex "STAT"
          // the second one is file mode
          // the third one is file length
          // and the last one is file time (lastModified?)
          fileSize = view[2];
          chunkSize = 0;
          remaining = fileSize;
          fileData = new Uint8Array(new ArrayBuffer(fileSize));
          headerArray = new Uint32Array(2);
          currentPos = 0;
          currentHeaderLength = 0;
          console.log("stat: OK");
          state = "send-recv";
          runFSM();
          break;
        case "send-recv":
          infoLengthPacket = new Uint32Array(1);
          infoLengthPacket[0] = aFrom.length;
          ADB.sockSend(socket, encoder.encode("RECV"));
          ADB.sockSend(socket, infoLengthPacket);
          ADB.sockSend(socket, encoder.encode(aFrom));

          state = "wait-recv";
          break;
        case "wait-recv":
          // After sending "RECV" command, adb server will send chunks data back,
          // Handle every single socket package here.
          // Note: One socket package maybe contain many chunks, and often
          // partial chunk at the end.
          pkgData = new Uint8Array(aData);

          // Handle all data in a single socket package.
          while(pkgData.length > 0) {
            if (chunkSize == 0 && checkDone(pkgData)) {
              OS.File.writeAtomic(aDest, fileData, {}).then(
                function onSuccess(number) {
                  console.log(number);
                  deferred.resolve("SUCCESS");
                },
                function onFailure(reason) {
                  console.log(reason);
                  deferred.reject("CANT_ACCESS_FILE");
                }
              );

              state = "send-quit";
              runFSM();
              return;
            }
            if (chunkSize == 0 && !checkChunkDataHeader(pkgData)) {
              shutdown();
              return;
            }
            // handle full chunk
            if (chunkSize > 0 && pkgData.length >= chunkSize) {
              let chunkData = pkgData.subarray(0, chunkSize);
              fileData.set(chunkData, currentPos);
              pkgData = pkgData.subarray(chunkSize, pkgData.length);
              currentPos += chunkSize;
              remaining -= chunkSize;
              chunkSize = 0;
            }
            // handle partial chunk at the end of socket package
            if (chunkSize > 0 && pkgData.length < chunkSize) {
              fileData.set(pkgData, currentPos);
              currentPos += pkgData.length;
              remaining -= pkgData.length;
              chunkSize -= pkgData.length;
              break; // Break while loop.
            }
          }

          break;
        case "send-quit":
          infoLengthPacket = new Uint32Array(1);
          infoLengthPacket[0] = 0;
          ADB.sockSend(socket, encoder.encode("QUIT"));
          ADB.sockSend(socket, infoLengthPacket);

          state = "end";
          runFSM();
          break;
        case "end":
          socket.close();
          break;
        default:
          console.log("pull Unexpected State: " + state);
          deferred.reject("UNEXPECTED_STATE");
      }
    }

    let setupSocket = function() {
      socket.onerror = function(aEvent) {
        console.log("pull onerror");
        deferred.reject("SOCKET_ERROR");
      }

      socket.onopen = function(aEvent) {
        console.log("pull onopen");
        state = "start";
        runFSM();
      }

      socket.onclose = function(aEvent) {
        console.log("pull onclose");
      }

      socket.ondata = function(aEvent) {
        console.log("pull ondata:");
        runFSM(aEvent.data);
      }
    }

    socket = ADB._connect();
    setupSocket();

    return deferred.promise;
  },

  /**
   * Dump the first few bytes of the given array to the console.
   *
   * @param {TypedArray} aArray
   *        the array to dump
   */
  hexdump: function adb_hexdump(aArray) {
    let decoder = new TextDecoder("windows-1252");
    let array = new Uint8Array(aArray.buffer);
    let s = decoder.decode(array);
    let len = array.length;
    let dbg = "len=" + len + " ";
    let l = len > 20 ? 20 : len;

    for (let i = 0; i < l; i++) {
      let c = array[i].toString(16);
      if (c.length == 1)
        c = "0" + c;
      dbg += c;
    }
    dbg += " ";
    for (let i = 0; i < l; i++) {
      let c = array[i];
      if (c < 32 || c > 127) {
        dbg += ".";
      } else {
        dbg += s[i];
      }
    }
    console.log(dbg);
  },

  // debugging version of tcpsocket.send()
  sockSend: function adb_sockSend(aSocket, aArray) {
    this.hexdump(aArray);

    aSocket.send(aArray.buffer, aArray.byteOffset, aArray.byteLength);
  },

  // pushes a file to the device.
  // aFrom and aDest are full paths.
  // XXX we should STAT the remote path before sending.
  push: function adb_push(aFrom, aDest) {
    let deferred = promise.defer();
    let socket;
    let state;
    let fileSize;
    let fileData;
    let remaining;
    let currentPos = 0;
    let fileTime;

    console.log("pushing " + aFrom + " -> " + aDest);

    let shutdown = function() {
      console.log("push shutdown");
      socket.close();
      deferred.reject("BAD_RESPONSE");
    }

    let runFSM = function runFSM(aData) {
      console.log("runFSM " + state);
      let req;
      switch(state) {
        case "start":
          state = "send-transport";
          runFSM();
          break;
        case "send-transport":
          req = ADB._createRequest("host:transport-any");
          ADB.sockSend(socket, req);
          state = "wait-transport";
          break
        case "wait-transport":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          console.log("transport: OK");
          state = "send-sync";
          runFSM();
          break
        case "send-sync":
          req = ADB._createRequest("sync:");
          ADB.sockSend(socket, req);
          state = "wait-sync";
          break
        case "wait-sync":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          console.log("sync: OK");
          state = "send-send";
          runFSM();
          break
        case "send-send":
          // need to send SEND + length($aDest,$fileMode)
          // $fileMode is not the octal one there.
          let encoder = new TextEncoder();

          let infoLengthPacket = new Uint32Array(1), info = aDest + ",33204";
          infoLengthPacket[0] = info.length;
          ADB.sockSend(socket, encoder.encode("SEND"));
          ADB.sockSend(socket, infoLengthPacket);
          ADB.sockSend(socket, encoder.encode(info));

          // now sending file data.
          while (remaining > 0) {
            let toSend = remaining > 65536 ? 65536 : remaining;
            console.log("Sending " + toSend + " bytes");

            let dataLengthPacket = new Uint32Array(1);
            // We have to create a new ArrayBuffer for the fileData slice
            // because nsIDOMTCPSocket (or ArrayBufferInputStream) chokes on
            // reused buffers, even when we don't modify their contents.
            let dataPacket = new Uint8Array(new ArrayBuffer(toSend));
            dataPacket.set(new Uint8Array(fileData.buffer, currentPos, toSend));
            dataLengthPacket[0] = toSend;
            ADB.sockSend(socket, encoder.encode("DATA"));
            ADB.sockSend(socket, dataLengthPacket);
            ADB.sockSend(socket, dataPacket);

            currentPos += toSend;
            remaining -= toSend;
          }

          // Ending up with DONE + mtime (wtf???)
          let fileTimePacket = new Uint32Array(1);
          fileTimePacket[0] = fileTime;
          ADB.sockSend(socket, encoder.encode("DONE"));
          ADB.sockSend(socket, fileTimePacket);

          state = "wait-done";
          break;
        case "wait-done":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          console.log("DONE: OK");
          state = "end";
          runFSM();
          break;
        case "end":
          socket.close();
          deferred.resolve("SUCCESS");
          break;
        default:
          console.log("push Unexpected State: " + state);
          deferred.reject("UNEXPECTED_STATE");
      }
    }

    let setupSocket = function() {
      socket.onerror = function(aEvent) {
        console.log("push onerror");
        deferred.reject("SOCKET_ERROR");
      }

      socket.onopen = function(aEvent) {
        console.log("push onopen");
        state = "start";
        runFSM();
      }

      socket.onclose = function(aEvent) {
        console.log("push onclose");
      }

      socket.ondata = function(aEvent) {
        console.log("push ondata");
        runFSM(aEvent.data);
      }
    }
    // Stat the file, get its size.
    OS.File.stat(aFrom).then(
      function onSuccess(stat) {
        if (stat.isDir) {
          // The path represents a directory
          deferred.reject("CANT_PUSH_DIR");
        } else {
          // The path represents a file, not a directory
          fileSize = stat.size;
          // We want seconds since epoch
          fileTime = stat.lastModificationDate.getTime() / 1000;
          remaining = fileSize;
          console.log(aFrom + " size is " + fileSize);
          let readPromise = OS.File.read(aFrom);
          readPromise.then(
            function readSuccess(aData) {
              fileData = aData;
              socket = ADB._connect();
              setupSocket();
            },
            function readError() {
              deferred.reject("READ_FAILED");
            }
          );
        }
      },
      function onFailure(reason) {
        console.log(reason);
        deferred.reject("CANT_ACCESS_FILE");
      }
    );

    return deferred.promise;
  },

  // Run a shell command
  shell: function adb_shell(aCommand) {
    let deferred = promise.defer();
    let socket;
    let state;
    let stdout = "";

    console.log("shell " + aCommand);

    let shutdown = function() {
      console.log("shell shutdown");
      socket.close();
      deferred.reject("BAD_RESPONSE");
    }

    let runFSM = function runFSM(aData) {
      console.log("runFSM " + state);
      let req;
      switch(state) {
        case "start":
          state = "send-transport";
          runFSM();
        break;
        case "send-transport":
          req = ADB._createRequest("host:transport-any");
          ADB.sockSend(socket, req);
          state = "wait-transport";
        break
        case "wait-transport":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          state = "send-shell";
          runFSM();
        break
        case "send-shell":
          req = ADB._createRequest("shell:" + aCommand);
          ADB.sockSend(socket, req);
          state = "rec-shell";
        break
        case "rec-shell":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          state = "decode-shell";
          runFSM();
        break;
        case "decode-shell":
          if (aData) {
            let decoder = new TextDecoder();
            let text = new Uint8Array(aData);
            stdout += decoder.decode(text)
          }
        break;
        default:
          console.log("shell Unexpected State: " + state);
          deferred.reject("UNEXPECTED_STATE");
      }
    }

    socket = ADB._connect();
    socket.onerror = function(aEvent) {
      console.log("shell onerror");
      deferred.reject("SOCKET_ERROR");
    }

    socket.onopen = function(aEvent) {
      console.log("shell onopen");
      state = "start";
      runFSM();
    }

    socket.onclose = function(aEvent) {
      deferred.resolve(stdout);
      console.log("shell onclose");
    }

    socket.ondata = function(aEvent) {
      console.log("shell ondata");
      runFSM(aEvent.data);
    }

    return deferred.promise;
  },

  root: function adb_root() {
    let deferred = promise.defer();
    let socket;
    let state;

    console.log("root");

    let shutdown = function() {
      console.log("root shutdown");
      socket.close();
      deferred.reject("BAD_RESPONSE");
    }

    let runFSM = function runFSM(aData) {
      console.log("runFSM " + state);
      let req;
      switch(state) {
        case "start":
          state = "send-transport";
          runFSM();
        break;
        case "send-transport":
          req = ADB._createRequest("host:transport-any");
          ADB.sockSend(socket, req);
          state = "wait-transport";
        break
        case "wait-transport":
          if (!ADB._checkResponse(aData, OKAY)) {
            shutdown();
            return;
          }
          state = "send-root";
          runFSM();
        break
        case "send-root":
          req = ADB._createRequest("root:");
          ADB.sockSend(socket, req);
          state = "rec-root";
        break
        case "rec-root":
          // Nothing to do
        break;
        default:
          console.log("root Unexpected State: " + state);
          deferred.reject("UNEXPECTED_STATE");
      }
    }

    socket = ADB._connect();
    socket.onerror = function(aEvent) {
      console.log("root onerror");
      deferred.reject("SOCKET_ERROR");
    }

    socket.onopen = function(aEvent) {
      console.log("root onopen");
      state = "start";
      runFSM();
    }

    socket.onclose = function(aEvent) {
      deferred.resolve();
      console.log("root onclose");
    }

    socket.ondata = function(aEvent) {
      console.log("root ondata");
      runFSM(aEvent.data);
    }

    return deferred.promise;
  },

  // Asynchronously runs an adb command.
  // @param aCommand The command as documented in
  // http://androidxref.com/4.0.4/xref/system/core/adb/SERVICES.TXT
  runCommand: function adb_runCommand(aCommand) {
    console.log("runCommand " + aCommand);
    let deferred = promise.defer();
    if (!this.ready) {
      setTimeout(function() { deferred.reject("ADB_NOT_READY"); });
      return deferred.promise;
    }

    let socket = this._connect();
    let waitForFirst = true;
    let devices = {};

    socket.onopen = function() {
      console.log("runCommand onopen");
      let req = this._createRequest(aCommand);
      ADB.sockSend(socket, req);

    }.bind(this);

    socket.onerror = function() {
      console.log("runCommand onerror");
      deferred.reject("NETWORK_ERROR");
    }

    socket.onclose = function() {
      console.log("runCommand onclose");
    }

    socket.ondata = function(aEvent) {
      console.log("runCommand ondata");
      let data = aEvent.data;

      if (!this._checkResponse(data, OKAY)) {
        socket.close();
        let packet = this._unpackPacket(data, false);
        console.log("Error: " + packet.data);
        deferred.reject("PROTOCOL_ERROR");
        return;
      }

      let packet = this._unpackPacket(data, false);
      deferred.resolve(packet.data);
    }.bind(this);


    return deferred.promise;
  }
}

ADB.init();

module.exports = ADB;
