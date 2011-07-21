(function() {

    self.port.on("sessions.clear", onSessionsClear);
    self.port.on("sessions.set", onSessionsSet);

    var username = document.getElementById("username");
    var body = document.querySelector("body");
    function onSessionsClear() {
        username.innerHTML = '';
    };

    function onSessionsSet(sessions) {
        username.innerHTML = sessions[0].email;
        self.port.emit("sessions.setheight", body.clientHeight);
    }

    var logout = document.getElementById("logout");
    logout.addEventListener("click", function() {
        self.port.emit("sessions.logout");
    }, false);
}());
