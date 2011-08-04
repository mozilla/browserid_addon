(function() {


    let doc = unsafeWindow.document;

    if(unsafeWindow.top !== unsafeWindow.self) {
        // IFRAMEs will not have the same content, so we get out of here.
        return; 
    }
    let loginEls = doc.querySelectorAll('#screen-name span');

    let sessions = [];

    if(loginEls && loginEls.length) {
        let count = loginEls.length;

        for(let index = 0, loginEl; index < count; ++index) {
            loginEl = loginEls[index];
            let email = loginEl.innerHTML;
            email = email.trim();
            if(email) {
                sessions.push({
                    email: email,
                    bound_to: {
                        type: "cookie",
                        name: "_twitter_sess"
                    }
                });
            }
        }
    }

    unsafeWindow.navigator.id.sessions = sessions;

    doc.addEventListener("login", function(event) {
        doc.location.href = "https://www.twitter.com/login";
    },false);

    doc.addEventListener("logout", function(event) {
        unsafeWindow.navigator.id.sessions = [];
        doc.location.href = "http://www.twitter.com/logout";
    },false);
}());
