
(function() {
    let id = unsafeWindow.navigator.id = unsafeWindow.navigator.id || {};
    let sessions;

    Object.defineProperty(id, "sessions", {
        enumerable: true,
        get: function() { return sessions; },
        set: function(newSessions) { 
            sessions = newSessions; 
            broadcastSessions();
            return true; 
        }
    });

    self.port.on("emitevent.login", emitEvent.bind(undefined, "login"));
    self.port.on("emitevent.logout", emitEvent.bind(undefined, "logout"));
    self.port.on("sessions.get", broadcastSessions);

    init();

    function emitEvent(name) {
        var doc = unsafeWindow.document;
        var evt = doc.createEvent("UIEvents");
        evt.initUIEvent(name, false, false, unsafeWindow, 1);
        doc.dispatchEvent(evt);
    }

    function init() {
      if(unsafeWindow.top === unsafeWindow.self) {
          unsafeWindow.addEventListener("load", function() {
            self.port.emit("sessions.tabready");
          }, false);

          self.port.emit("sessions.opentab", {
            host: unsafeWindow.document.location.host 
          });
      }
    }

    function broadcastSessions() {
        console.log("broadcastingSessions");
        self.port.emit("sessions.set", {
            sessions: sessions,
            host: unsafeWindow.document.location.host
        });
    }
}());

