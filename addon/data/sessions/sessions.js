(function() {

    self.port.on("sessions.clear", onSessionsClear);
    self.port.on("sessions.set", onSessionsSet);

    var username = document.getElementById("username");
    var body = document.querySelector("body");
    function onSessionsClear() {
        username.innerHTML = '';
    };

    function onSessionsSet(sessions) {
        onSessionsClear();
        if(sessions && sessions.length) {
            // remove all previous children
            while(username.childNodes.length) {
              var child = username.childNodes[0];
              username.removeChild(child);
            }

            // create and append new name.
            var email = sessions[0].email || '';
            var newName = document.createTextNode(email);
            username.appendChild(newName);
            self.port.emit("sessions.setheight", body.clientHeight);
        }
    }

    var logout = document.getElementById("logout");
    logout.addEventListener("click", function() {
        self.port.emit("sessions.logout");
    }, false);
}());
