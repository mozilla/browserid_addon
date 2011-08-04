
let nav = unsafeWindow.navigator;

nav.id = nav.id || {};
nav.id.channel = nav.id.channel || {};

let browseridController;

console.log("adding controller: " + unsafeWindow.document.location.host);

nav.id.channel.registerController = function(controller) {
    browseridController = controller;    
    console.log("registering controller");
    self.port.emit("controllerReady");
};

self.port.on("getVerifiedEmail", function(payload) {
    browseridController.getVerifiedEmail.call(browseridController,
        payload.host, 
        onGetAssertionSuccess,
        onGetAssertionFailure
    );
});

function onGetAssertionSuccess(assertion) {
    self.port.emit("assertionReady", {
        assertion: assertion
    });
}

function onGetAssertionFailure(reason) {
    self.port.emit("assertionFailure", {
        reason: reason
    });
}

