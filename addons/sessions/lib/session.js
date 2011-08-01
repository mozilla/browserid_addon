let {Model} = require("model");

let Session = function() {
    let session = new Model({
        fields: ['sessions']
    });

    session.getActive = function() {
        let active, 
            sessions = this.sessions;
        
        if(sessions) {
          if(sessions.length === 1) {
            active = sessions[0];
          } else {
            sessions.forEach(function(session) {
              if(session.status === 'active') {
                active = session;
              }
            });
          }
        }

        return active;
    };

    return session;
};

exports.Session = Session;
