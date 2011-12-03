
let nav = unsafeWindow.navigator;

nav.id = nav.id || {};
nav.id.channel = nav.id.channel || {};

let browseridController;
let complete;

nav.id.channel.registerController = function(controller) {
  browseridController = controller;    
  self.port.emit("controllerReady");
};

self.port.on("getVerifiedEmail", function(payload) {
  browseridController.getVerifiedEmail(
    payload.host, 
    onGetAssertionSuccess,
    onGetAssertionFailure
  );
});

function onGetAssertionSuccess(assertion) {
  if (assertion) {
    emit("assertionReady", {
      assertion: assertion
    });
  }
}

function onGetAssertionFailure(reason) {
  emit("assertionFailure", {
    reason: reason
  });
}

function emit(message, payload) {
    // Only send a message if we haven't already sent one, otherwise we can get 
    // into confusing states.
    if(!complete) {
        complete = true;
        self.port.emit(message, payload); 
    }
}

