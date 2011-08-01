let {Model} = require("model");

let Session = function(config) {
    let session = new Model({
        fields: ["sessions","host"]
    });

    session.getActive = getActive;
    session.noInfo = noInfo;
    // Have to bind it to the session - it is used as a callback
    session.onCookieChange = onCookieChange.bind(session);
    session.bound = false;
    session.addBinding = addBinding;
    session.removeBinding = removeBinding;

    if(config) {
      session.host = config.host;
      session.cookieManager = config.cookieManager;
    }

    session.on("beforeset:host", onBeforeSetHost.bind(session));
    session.on("beforeset:sessions", onBeforeSetSessions.bind(session));
    session.on("set:sessions", onSetSessions.bind(session));


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
  if (!this.binding) {
    this.sessions = undefined;
  }
}

function onBeforeSetSessions(sessions) {
  this.removeBinding();
}

function onSetSessions(sessions) {
  let active = this.getActive();
  let binding = active && active.bound_to;

  this.addBinding(binding);
}

function onBeforeSetHost(host) {
  if(host !== this.host) {
    this.sessions = undefined;
  }
}

function onCookieChange() {
  this.removeBinding();
}

function addBinding(binding) {
  if (binding && binding.type === "cookie" && this.cookieManager) {
    this.binding = {
      host: this.host,
      name: binding.name,
      type: binding.type
    };
    this.cookieManager.watch(this.host, binding.name, this.onCookieChange);
  }
}

function removeBinding() {
  var binding = this.binding;
  if(binding && binding.type === "cookie" && this.cookieManager) {
    this.cookieManager.unwatch(binding.host, binding.name, this.onCookieChange);
    this.binding = undefined;
  }
}

exports.Session = Session;
