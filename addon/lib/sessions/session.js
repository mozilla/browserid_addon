let {Model} = require("sessions/model");

// This is the Session model.  It holds information about a session.
// A session is a host, it's session information, and it's bindings.
let Session = function(config) {
    let session = new Model({
        fields: ["sessions", "host"]
    });

    session.noInfo = noInfo;
    session.getActive = getActive.bind(session);

    if (config && config.bindings) {
      session.getSavedSessions = getSavedSessions;
      session.addBinding = addBinding;
      session.removeBinding = removeBinding;

      session.host = config.host;
      session.bindings = config.bindings;

      session.on("set:host", onSetHost.bind(session));
      session.on("beforeset:sessions", onBeforeSetSessions.bind(session));
      session.on("set:sessions", onSetSessions.bind(session));
    }


    return session;
};

// No info was specified for the current host, see if there is any info in our 
// saved sessions cache.
function noInfo() {
  let sessions = this.getSavedSessions && this.getSavedSessions(this.host);
  this.sessions = sessions;
}

function onBeforeSetSessions(sessions) {
  // If the host has not changed but the sessions info has, remove any bindings 
  // that may have been saved for this host.
  if (!this.hostChange) {
    // We only remove bindings IF we are overwriting the
    // bindings for the current host
    this.removeBinding(this.host);
  }
  this.hostChange = false;
}

// Set the sessions array.  Why an array?  Because in the future we would like 
// to support having multiple sessions specified, one active, multiple 
// "passive"
function onSetSessions(sessions) {
  // Add new bindings
  let active = this.getActive();

  if(active) {
    active.host = this.host;
    this.addBinding(active);
  }
}

// When we set the host, immediately check the cache to see if there are any 
// saved sessions.  If there are, show em.  Helps reduce flicker and update 
// things as quickly as possible.
function onSetHost(host) {
  this.hostChange = true;
  this.sessions = this.getSavedSessions(host);
}

// Attempt to add a binding based on a cookie.  The binding will remain active 
// as long as the cookie value remains the same.
function addBinding(session) {
  let binding = session && session.bound_to;
  if (binding && binding.type === "cookie" && this.bindings) {
    this.bindings.add(session);
  }
}

// Remove a binding, user has logged out or the cookie has changed.
function removeBinding(host) {
  if (this.bindings) {
    this.bindings.remove(host);
  }
}

// Check the cache for any saved sessions.
function getSavedSessions(host) {
  let binding = this.bindings && this.bindings.get(host);
  let sessions = binding && [binding];

  return sessions;
}

// See if any sessions are currently marked as active.
function getActive() {
  let active, sessions = this.sessions;

  if (sessions) {
    if (sessions.length === 1) {
      active = sessions[0];
    } else {
      sessions.forEach(function(session) {
        if (session.status === "active") {
          active = session;
        }
      });
    }
  }

  return active;
}


exports.Session = Session;
