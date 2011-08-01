
(function() {
    let id = unsafeWindow.navigator.id = unsafeWindow.navigator.id || {};
    let sessions;

    Object.defineProperty(id, "sessions", {
        enumerable: true,
        get: function() { return sessions; },
        set: function(newSessions) { 
            sessions = newSessions; 
            self.port.emit("sessions.set", {
                sessions: sessions,
                host: unsafeWindow.document.location.host
            });
            return true; 
        }
    });

    self.port.on("emitevent.login", emitEvent.bind(undefined, "login"));
    self.port.on("emitevent.logout", emitEvent.bind(undefined, "logout"));

    function emitEvent(name) {
        //console.log('emitting event: ' + name);
        var doc = unsafeWindow.document;
        var evt = doc.createEvent("UIEvents");
        evt.initUIEvent(name, false, false, unsafeWindow, 1);
        doc.dispatchEvent(evt);
    }

    if(unsafeWindow.top === unsafeWindow.self) {
        self.port.emit("sessions.opentab");
    }
}());

