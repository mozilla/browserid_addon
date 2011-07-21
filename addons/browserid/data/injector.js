(function() {
    let assertionCallback;

    self.port.on("assertionReady", function(payload) {
        if(assertionCallback) {
            console.log("The assertion is finally ready! " + payload.assertion);
            assertionCallback(payload.assertion);
        }
    });

    var nav = unsafeWindow.navigator;
    nav.id = nav.id || {};
    nav.id.getVerifiedEmail = function(callback) {
        assertionCallback = callback;
        self.port.emit("getAssertion", {
            location: unsafeWindow.location.toString()
        });
    };

}());
