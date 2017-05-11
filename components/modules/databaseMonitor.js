/*============================================================================
    Module for monitoring changes in the database.
 ============================================================================*/

// Import what you need here, but you should rather send them through
// from the main driver as variables in the init method.

function init(admin, templates, transporter) {

    console.log("Loading DATABASE MONITOR module...");

    /*======================================================================*\
     If the child of a user changes, run this code.
     \*======================================================================*/
    try{
        admin.database().ref('users').on('child_changed', function(snapshot) {
            let user = snapshot.val();
            if (user.accountType === "vendor" && user.vendorRequest === true) {
                admin.database().ref('users/' + snapshot.key).update({
                    vendorRequest: false
                });
                if (user.email) {
                    let vendorWelcome = {
                        name : user.name
                    };
                    templates.render('registeredVendor.html', vendorWelcome, function(err, html, text) {

                        let mailOptions = {
                            from: 'info@pear.life', // sender address
                            replyTo: 'noreply@pear.life', //Reply to address
                            to: user.email, // list of receivers
                            subject: 'Pear - You are now a registered vendor', // Subject line
                            html: html, // html body
                            text: text  //Text equivalent
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log("VENDOR REGISTRATION ERROR");
                                return console.log(error);
                            }
                            console.log('Message sent: ' + info.response);
                        });
                    });

                }
            }
        });
        console.log("MODULE LOADED!");
    } catch (ex){
        console.log("UNABLE TO LOAD DATABASE MONITOR! See exception below: " );
        console.log(ex);
    }
}

module.exports = {
    init: init
};
