(function() {


    let doc = unsafeWindow.document;

    if(unsafeWindow.top !== unsafeWindow.self) {
//        console.log('this is an iframe, get outta here');
        // IFRAMEs will not have the same content, so we get out of here.
        return; 
    }
    let loginEls = doc.querySelectorAll('.gbps2');

    //console.log('length: ' + loginEls.length);
    let sessions = [];

    if(loginEls && loginEls.length) {
        let count = loginEls.length;

        for(let index = 0, loginEl; index < count; ++index) {
            loginEl = loginEls[index];
            let email = loginEl.innerHTML;
            if(email) {
                sessions.push({
                    email: email,
                    bound_to: {
                        type: "cookie",
                        name: "SID"
                    }
                });
            }
        }
    }

    //console.log("sessions: " + sessions);
    unsafeWindow.navigator.id.sessions = sessions;

    doc.addEventListener("login", function(event) {
     //   console.log("going to login page");
        doc.location.href = "https://www.google.com/accounts/ServiceLogin?hl=en&continue=" + doc.location.href;
    },false);

    doc.addEventListener("logout", function(event) {
        //console.log("clearing sessions, logout");
        unsafeWindow.navigator.id.sessions = [];
        doc.location.href = "http://www.google.com/accounts/Logout?continue=" + doc.location.href;
    },false);
}());
