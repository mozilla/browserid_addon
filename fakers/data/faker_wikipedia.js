(function() {


    let doc = unsafeWindow.document;

    if(unsafeWindow.top !== unsafeWindow.self) {
//        console.log('this is an iframe, get outta here');
        // IFRAMEs will not have the same content, so we get out of here.
        return; 
    }
    let loginEls = doc.querySelectorAll('#pt-userpage a');

    // set this undefined initially to fake that we have no JS enabled
    // which could happen if we are viewing an image without the rest of 
    // the page content.
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
                        name: "centralauth_User"
                    }
                });
            }
        }
    }

    unsafeWindow.navigator.id.sessions = sessions;

    doc.addEventListener("login", function(event) {
        doc.location.href = "http://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main_Page&campaign=ACP1";
    },false);

    doc.addEventListener("logout", function(event) {
        unsafeWindow.navigator.id.sessions = [];
        doc.location.href = "http://en.wikipedia.org/w/index.php?title=Special:UserLogout&returnto=Main_Page";
    },false);
}());
