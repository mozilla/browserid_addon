"use strict";

const {Bindings} = require("bindings");
const {CookieMonster} = require("cookie_monster");

let bindings, cookieManager,
    binding = {
      host: "labs.mozilla.com",
      email: "labs@mozilla.com",
      bound_to: {
        type: "cookie",
        name: "SID"
      }
    };

exports.setup = function() {
  if(!cookieManager) {
    cookieManager = new CookieMonster();
  }
  cookieManager.clear();

  bindings = new Bindings({
    cookieManager: cookieManager 
  });

  bindings.clear();
};

exports.teardown = function() {
  bindings.teardown();
};


exports["can create"] = function(test) {
  test.assertNotUndefined(bindings, "we have bindings");
};

exports["can add/get a binding with info"] = function(test) {
  bindings.add(binding);
  test.assertEqual(bindings.length, 1, "we have a binding");

  let getVal = bindings.get("labs.mozilla.com");
  test.assertEqual(getVal.host, "labs.mozilla.com", "We can get a binding by host name");
};

exports["can remove a binding"] = function(test) {
  bindings.add(binding);

  let callback = function(binding) {
    test.pass("we have removal");

    bindings.removeListener("remove", callback);
    test.done();  
  };

  bindings.on("remove", callback);
  bindings.remove("labs.mozilla.com");
  let getVal = bindings.get("labs.mozilla.com");
  test.assertUndefined(getVal, "Empty collection, no bindings");

  test.waitUntilDone();

};


exports["can reset the info"] = function(test) {
  bindings.add(binding);
  bindings.clear();
  test.assertEqual(bindings.length, 0, "can reset the bindings");

  let getVal = bindings.get("labs.mozilla.com");
  test.assertUndefined(getVal, "Empty collection, no bindings");

  let handlers = cookieManager.getHandlers("labs.mozilla.com", "SID");
  test.assertEqual(0, handlers.length, "No handlers here!");
};

exports["Can clear binding by changing cookie"] = function(test) {
  bindings.add(binding);

  cookieManager.simulate("labs.mozilla.com", "SID", "fakeValue");
  test.assertEqual(bindings.length, 0, "can reset the bindings");

  let getVal = bindings.get("labs.mozilla.com");
  test.assertUndefined(getVal, "Empty collection, no bindings");
};

exports["If adding a second binding to same host, only one binding active at a time."] = function(test) {
  bindings.add(binding);

  bindings.add({
    host: "labs.mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SSID"
    }
  });

  test.assertEqual(bindings.length, 1, "Only one binding active for host");

  cookieManager.simulate("labs.mozilla.com", "SID", "fakeValue");
  test.assertEqual(bindings.length, 1, "The changing of an old cookie should have no effect");
};
