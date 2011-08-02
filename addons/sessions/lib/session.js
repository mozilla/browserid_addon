let {Model} = require("model");
let {Helpers} = require("helpers");

let Session = function(config) {
    let session = new Model({
        fields: ["sessions", "host"]
    });

    session.getActive = getActive;

    if(config) {
      session.noInfo = noInfo;
      // Have to bind it to the session - it is used as a callback
      session.onBindingRemove = onBindingRemove.bind(session);
      session.addBinding = addBinding;
      session.removeBinding = removeBinding;
      session.host = config.host;
      session.bindings = config.bindings;
      session.bindings.on("remove", session.onBindingRemove);
      session.on("beforeset:host", onBeforeSetHost.bind(session));
      session.on("beforeset:sessions", onBeforeSetSessions.bind(session));
      session.on("set:sessions", onSetSessions.bind(session));
    }


    return session;
};

function getActive() {
  let active, 
      sessions = this.sessions;
  
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

function noInfo() {
  let binding = this.bindings.get(this.host);
  if(binding) {
    //this.sessions = [binding];
  }
  else {
    this.sessions = undefined;
  }
}

function onBeforeSetSessions(sessions) {
  this.removeBinding();
}

function onSetSessions(sessions) {
  let active = this.getActive();

  this.addBinding(active);
}

function onBeforeSetHost(host) {
  if(host !== this.host) {
    this.sessions = undefined;
  }
}

function onBindingRemove(binding) {
  if(binding.host === this.host) {
    this.removeBinding();
  }
}

function addBinding(session) {
  let binding = session && session.bound_to;
  if (binding && binding.type === "cookie" && this.bindings) {
    session.host = this.host;
    this.bindings.add(session);
  }
}

function removeBinding() {
  let binding = this.bindings.get(this.host);
  if(binding && binding.type === "cookie" && this.bindings) {
    this.bindings.remove(binding.host);
  }
}

exports.Session = Session;
