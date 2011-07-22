let {Model} = require("model");

let Session = function() {
    let session = new Model({
        fields: ['email', 'status']
    });
    return session;
};

exports.Session = Session;
