/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { Cc, Ci, Cr, Cu } = require("chrome");
const { Class } = require("sdk/core/heritage");

Cu.import("resource://gre/modules/Services.jsm");

let { TextDecoder } = Cu.import("resource://gre/modules/Services.jsm");

const OLD_SOCKET_API =
  Services.vc.compare(Services.appinfo.platformVersion, "23.0a1") < 0;

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

let TCPSocket = createTCPSocket();

// Creates a socket connected to the adb instance.
// This instantiation is sync, and returns before we know if opening the
// connection succeeds. Callers must attach handlers to the s field.
let AdbSocket = Class({
  initialize: function initialize() {
    this.s =
      TCPSocket.open("127.0.0.1", 5037, { binaryType: "arraybuffer" });
  },

  /**
   * Dump the first few bytes of the given array to the console.
   *
   * @param {TypedArray} aArray
   *        the array to dump
   */
  _hexdump: function hexdump(aArray) {
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
    console.debug(dbg);
  },

  // debugging version of tcpsocket.send()
  send: function send(aArray) {
    this._hexdump(aArray);

    if (OLD_SOCKET_API) {
      // Create a new Uint8Array in case the array we got is of a different type
      // (like Uint32Array), since the old API takes a Uint8Array.
      this.s.send(new Uint8Array(aArray.buffer));
    } else {
      this.s.send(aArray.buffer, aArray.byteOffset, aArray.byteLength);
    }
  },

  close: function close() {
    if (this.s.readyState === "open" ||
        this.s.readyState === "connecting") {
      this.s.close();
    }
  }
});

exports.AdbSocket = AdbSocket;

