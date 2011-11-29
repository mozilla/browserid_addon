
(function() {
    let id = unsafeWindow.navigator.id = unsafeWindow.navigator.id || {};
    let sessions;

    // Define a getter and setter on window.navigator.id.sessions so that when 
    //  the page's content writes to the sessions array, the notification box 
    //  in the URL bar is updated
    Object.defineProperty(id, "sessions", {
        enumerable: true,
        get: function() { return sessions; },
        set: function(newSessions) { 
            sessions = newSessions; 
            broadcastSessions();
            return true; 
        }
    });

    // The login and logout event come when the user interacts with the 
    // notification box in the URL bar.  If the user clicks "Sign In", we emit 
    // the login event to the page, which should then take action to either 
    // redirect the user to their login page or show BrowserID.  Logout should 
    // log the user out.
    self.port.on("emitevent.login", emitEvent.bind(undefined, "login"));
    self.port.on("emitevent.logout", emitEvent.bind(undefined, "logout"));

    // sessions.get is a "pull request" to get the session information.
    self.port.on("sessions.get", broadcastSessions);

    init();

    function init() {
      // Only run this at the top level, do not run inside of an IFRAME.
      if(unsafeWindow.top === unsafeWindow.self) {
          unsafeWindow.addEventListener("beforeunload", function() {
              // NOTE!  DO NOT REMOVE THIS!  Without it, for some reason
              // the worker is sometimes NOT torn down for pages that have
              // no IFRAMES and you are going back and forth through history
              // google.com and myfavoritebeer.org are examples.  This is
              // voodoo here.
          }, false);
          
          // If session information has not been set by time the user content 
          // is fully loaded, we remove the notification box from the URL bar.
          // We inform the parent when user content load has happened.
          unsafeWindow.addEventListener("load", function() {
              self.port.emit("sessions.tabready");
          }, false);

          // Every time a new URL is opened in the tab, we inform the parent so 
          // that it can look in its cache to see if there is any session 
          // information for the host.  If there is, display it before the load 
          // event happens.  This helps reduce flicker.
          self.port.emit("sessions.opentab", {
            host: unsafeWindow.document.location.host 
          });
      }
    }

    // Emits the login/logout message to user content.
    function emitEvent(name) {
        var doc = unsafeWindow.document;
        var evt = doc.createEvent("UIEvents");
        evt.initUIEvent(name, false, false, unsafeWindow, 1);
        doc.dispatchEvent(evt);
    }

    // broadcast the sessions back to the callers
    function broadcastSessions() {
        self.port.emit("sessions.set", {
            sessions: sessions,
            host: unsafeWindow.document.location.host
        });
    }
}());

