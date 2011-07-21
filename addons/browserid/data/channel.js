
let nav = unsafeWindow.navigator;

nav.id = nav.id || {};
nav.id.channel = nav.id.channel || {};

let browseridController;

nav.id.channel.registerController = function(controller) {
    browseridController = controller;    
    self.port.emit("controllerReady");
};

self.port.on("getVerifiedEmail", function(payload) {
    browseridController.getVerifiedEmail.call( browseridController,
        payload.host, 
        unsafeWindow.onGetAssertionSuccess,
        unsafeWindow.onGetAssertionFailure
    );
});

unsafeWindow.onGetAssertionSuccess = function(assertion) {
    console.log("getVerifiedEmail assertion: " + assertion);
    self.port.emit("assertionReady", {
        assertion: assertion
    });
}

unsafeWindow.onGetAssertionFailure = function() {
    console.log("failure getting verified email");
}

