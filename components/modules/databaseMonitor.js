/*============================================================================
    Module for monitoring changes in the database.
 ============================================================================*/

// Import what you need here, but you should rather send them through
// from the main driver as variables in the init method.

function init(admin, templates, transporter, mailgun, rek, googl) {

    console.log("Loading DATABASE MONITOR module...");

    var moment = rek('moment');
    var wkhtmltopdf = rek('wkhtmltopdf');
    var Xvfb = rek('xvfb');
    var path = rek('path');
    var fs = rek('fs');
    var stream = rek('stream');
    var pdf = rek('html-pdf');
    var pug = rek('pug');
    var mailcomposer = rek('mailcomposer');
    const bloom_main_address = "Bloom Weddings <noreply@bloomweddings.co.za>";
    const bloom_support_address = "Bloom Support <support@bloomweddings.co.za>";

    /*======================================================================*\
        If the child of a user changes, run this code.
    \*======================================================================*/
    // admin.database().ref('users').on('child_changed', function(snapshot) {
    //     var user = snapshot.val();
    //     if (user.accountType === "vendor" && user.vendorRequest === true) {
    //         admin.database().ref('users/' + snapshot.key).update({
    //             vendorRequest: false
    //         });
    //         if (user.email) {
    //             var vendorWelcome = {
    //                 name: user.name
    //             };
    //             templates.render('registeredVendor.html', vendorWelcome, function(err, html, text) {
    //
    //                 var mailOptions = {
    //                     from: 'info@pear.life', // sender address
    //                     replyTo: 'noreply@pear.life', //Reply to address
    //                     to: user.email, // list of receivers
    //                     subject: 'Pear - You are now a registered vendor', // Subject line
    //                     html: html, // html body
    //                     text: text //Text equivalent
    //                 };
    //
    //                 sendMail(mailOptions, function() {});
    //
    //                 // send mail with defined transport object
    //                 // transporter.sendMail(mailOptions, function(error, info) {
    //                 //     if (error) {
    //                 //         console.log("VENDOR REGISTRATION ERROR");
    //                 //         return console.log(error);
    //                 //     }
    //                 //     console.log('Message sent: ' + info.response);
    //                 // });
    //                 //console.log("was going to send a mail, user/signup/vendor");
    //             });
    //
    //         }
    //     }
    // });

    /*======================================================================*\
        If a new message request is created, run this.
    \*======================================================================*/
    admin.database().ref('messages').on('child_added', function(snapshot) {
        console.log("New message request");
        var message = snapshot.val();
        var mailTo = "";
        if (message.to) {
            mailTo = message.to
            if(message.senderId !== "Anonymous user") {
                admin.database().ref('users/' + message.senderId).once('value').then(function(_snapshot) {
                    admin.database().ref('weddings/' + message.senderId).once('value').then(function(__snapshot) {
                        var guestC = "Unknown";
                        var weddingDateFormatted = "Unknown";
                        if (message.sendInfo) {
                            var wedding = __snapshot.val();
                            if (wedding.estimatedGuests) {
                                guestC = wedding.estimatedGuests;
                            } else if (wedding.guestsTotal) {
                                guestC = wedding.guestsTotal;
                            }
                            try {
                                var weddingDate = moment(wedding.weddingDate);
                                weddingDateFormatted = weddingDate.format('Do MMM YYYY');
                            } catch (ex) {}
                        }

                        var customMessage = {
                            senderName: _snapshot.val().name || "User",
                            receiverName: message.receiverName,
                            guestCount: guestC,
                            weddingDate: weddingDateFormatted,
                            messageText: message.html
                        };
                        templates.render('messageRequestVendor.html', customMessage, function(err, html, text) {
                            var mailOptions = {
                                from: message.from, // sender address
                                replyTo: message.from, //Reply to address
                                to: mailTo, // list of receivers
                                subject: message.subject, // Subject line
                                html: html, // html body
                                text: text //Text equivalent
                            };

                            sendMail(mailOptions, function() {
                              admin.database().ref('messages/' + snapshot.key).remove();
                            });

                        });
                    });

                });
            } else {
                var customMessage = {
                    senderName: "Anonymous User",
                    receiverName: message.receiverName,
                    guestCount: "Unknown",
                    weddingDate: "Unknown",
                    messageText: message.html
                };
                templates.render('messageRequestVendor.html', customMessage, function(err, html, text) {
                    var mailOptions = {
                        from: message.from, // sender address
                        replyTo: message.from, //Reply to address
                        to: mailTo, // list of receivers
                        subject: message.subject, // Subject line
                        html: html, // html body
                        text: text //Text equivalent
                    };

                    sendMail(mailOptions, function() {
                        admin.database().ref('messages/' + snapshot.key).remove();
                    });

                });
            }
        } else {

            mailTo = bloom_support_address;
            var customMessage = {
                senderName: "Anonymous User",
                receiverName: "Bloom Support",
                messageText: message.html
            };
            templates.render('messageRequest.html', customMessage, function(err, html, text) {
                var mailOptions = {
                    from: message.from, // sender address
                    replyTo: message.from, //Reply to address
                    to: mailTo, // list of receivers
                    subject: message.subject, // Subject line
                    html: html, // html body
                    text: text //Text equivalent
                };


                sendMail(mailOptions, function() {
                     admin.database().ref('messages/' + snapshot.key).remove();
                });

                // send mail with defined transport object
                // transporter.sendMail(mailOptions, function(error, info) {
                //     if (error) {
                //         console.log("MESSAGE REQUEST ERROR");
                //         return console.log(error);
                //     }
                //     console.log('Message sent: ' + info.response);
                //     admin.database().ref('messages/' + snapshot.key).remove();
                // });
                //console.log("was going to send a mail, messaging support");
            });

        }

    });


    /*======================================================================*\
        If a new account is created, run this.
    \*======================================================================*/
    admin.database().ref('users').on('child_added', function(snapshot) {

        var user = snapshot.val();

        var userDetails = {
            name: user.name
        };
        if (user.isNewToBloom) {
            if (user.accountType) { // VENDOR. Mailed below

            } else { // USER
                templates.render('accountCreationUser.html', userDetails, function(err, html, text) {
                    var mailOptions = {
                        from: bloom_main_address, // sender address
                        replyTo: bloom_main_address, //Reply to address
                        to: user.email, // list of receivers
                        subject: "Bloom - User Account Created", // Subject line
                        html: html, // html body
                        text: text //Text equivalent
                    };

                    sendMail(mailOptions, function() {
                        admin.database().ref('users/' + snapshot.key).update({
                            isNewToBloom: null
                        });
                    });
                    // send mail with defined transport object
                    // transporter.sendMail(mailOptions, function(error, info) {
                    //     if (error) {
                    //         console.log("USER DOESN'T HAVE EMAIL");
                    //         return console.log(error);
                    //     }
                    //     console.log('Message sent: ' + info.response);
                    // });
                    //console.log("was going to send a mail, welcome user: " + snapshot.key + ", " + user.name);
                });

            }
        }


    });

    /*======================================================================*\
        If a new vendor account is created, run this.
    \*======================================================================*/
    admin.database().ref('vendorLogins').on('child_added', function(snapshot) {
        var login = snapshot.val();
        if (login.passTemp) {
            var userDetails = {
                password: login.passTemp,
                id: login.vendorID
            };


            templates.render('accountCreationVendor.html', userDetails, function(err, html, text) {
                var mailOptions = {
                    from: bloom_main_address, // sender address
                    replyTo: bloom_main_address, //Reply to address
                    to: login.email, // list of receivers
                    subject: "Bloom - Vendor Account Created", // Subject line
                    html: html, // html body
                    text: text //Text equivalent
                };

                sendMail(mailOptions, function() {
                    admin.database().ref('vendorLogins/' + snapshot.key).update({
                        passTemp: null
                    });
                });
                // send mail with defined transport object
                // transporter.sendMail(mailOptions, function(error, info) {
                //     if (error) {
                //         console.log("VENDOR DOESN'T HAVE EMAIL");
                //         return console.log(error);
                //     }
                //     console.log('Message sent: ' + info.response);
                // });
                //console.log("was going to send a mail, welcome vendor");
            });

            templates.render('accountCreationBcc.html', userDetails, function(err, html, text) {
                var mailOptions2 = {
                    from: bloom_main_address, // sender address
                    replyTo: bloom_main_address, //Reply to address
                    to: "bruce@bloomweddings.co.za, ineke@bloomweddings.co.za", // list of receivers
                    subject: "Bloom - Vendor Account Created", // Subject line
                    html: html, // html body
                    text: text //Text equivalent
                };

                sendMail(mailOptions2, function() {
                    admin.database().ref('vendorLogins/' + snapshot.key).update({
                        passTemp: null
                    });
                });
                // send mail with defined transport object
                // transporter.sendMail(mailOptions2, function(error, info) {
                //     if (error) {
                //         console.log("SOMETHING WENT WRONG!");
                //         return console.log(error);
                //     }
                //     console.log('Message sent: ' + info.response);
                // });
                //console.log("was going to send a mail, notify support account creation");
            });
        }

    });


    /*======================================================================*\
        If a guestList is created
    \*======================================================================*/
    admin.database().ref('guestLists').on('child_added', function(snapshot) {

        var list = snapshot.val();

        if(list.completed === false || list.completed === 'false') {
          console.log("Wedding invites created.");
          var id = snapshot.key;
          var acceptUrl = "https://bloomweddings.co.za/wedding-invite?id=" + id;
          var declineUrl = "https://bloomweddings.co.za/wedding-invite?id=" + id;
          var details = list.details;
          var name = "";
          var email = "";

          admin.database().ref('weddings/' + id).once('value').then(function(_snapshot) {
            var wedding = _snapshot.val();
            let guests = wedding.guests;
            // var length = guests.length;
            var promiseArr = [];
            var count = 0;
            //for each guest do the following
            //Object.assign(obj1, obj2); to merge

            for (var key in guests) {
              if (guests.hasOwnProperty(key)) {

                promiseArr[count] = new Promise((resolve, reject) => {
                  var _id = key;
                  admin.database().ref('guests/' + _id).once('value').then(function(__snapshot) {
                    var guest = __snapshot.val();
                    var name = guest.name;
                    var email = guest.email;
                    var _acceptUrl = acceptUrl + "&accept="+_id;
                    var _declineUrl = declineUrl + "&decline="+_id;
                    var guest = {
                      id: _id,
                      name: name,
                      email: email,
                      acceptUrl: _acceptUrl,
                      declineUrl: _declineUrl
                    };
                    resolve(guest);
                  }, function(){
                    var failed = {
                      id: _id,
                      error: "Could not find guest"
                    };
                    resolve(failed);
                  });
                });
              }
              count++;
            }

            Promise.all(promiseArr).then((guests) => {

              var failed = [];
              var successCount = 0; //Check this + failed to match length and mail user
              var failCount = 0;
              // var newpdf = new pdf('url', 'details.downloadURL');
              // var options = { format: 'Letter' };
              var createPDF = new Promise((resolve, reject) => {
                var src = path.join(__dirname, "../../templates/weddingInviteDefault.pug");
                template = pug.compileFile(src, {
                    debug: false,
                    pretty: true
                });
                var filepath = path.join(__dirname, '../../datafiles/' + id + 'wi.pdf');
                pdf.create(template(details)).toFile(filepath, function(err, res) {
                  if (err) {
                    return reject(err);
                  }
                  resolve(res); // { filename: 'name.pdf' }
                });
              });

              var attachText = "";

              if(details.downloadURL) {
                googl.shorten(details.downloadURL)
                  .then(function (shortUrl) {
                      attachText = "Please view your invite here: " + shortUrl;
                      generateInvites();
                  })
                  .catch(function (err) {
                      console.error(err.message);
                      attachText = "Please view your invite here: " + details.downloadURL;
                      generateInvites();
                  });
              } else {
                createPDF.then((response)=>{
                  attachText = "Please see your invite attached";
                  console.log("PDF generated successfully");
                  generateInvites(response.filename);
                });
              }

              function generateInvites (filepath) {
                var attch;
                var attachment;
                details.attach = attachText;

                if(filepath) {
                  var data1 = fs.readFileSync(filepath);
                  attachment = new mailgun.Attachment({data: data1, filename: 'wedding-invite.pdf'});
                }

                admin.database().ref('users/' + id).once('value').then(function(userSnapshot) {
                  var user = userSnapshot.val();
                  name = user.name;
                  email = user.email;

                  for (var i = 0; i < guests.length; i++) {
                    // do something with each guests[i]

                    // merge data
                    var detailsCopy = details;
                    Object.assign(detailsCopy, guests[i]);
                    detailsCopy.to = guests[i].email;
                    detailsCopy.id = userSnapshot.key;
                    // console.log(JSON.stringify(detailsCopy));

                    renderInvite(JSON.parse(JSON.stringify(detailsCopy)));
                  }
                });

                function renderInvite (_details) {
                  var mailOptions = {
                      from: bloom_main_address, // sender address
                      replyTo: email, //Reply to address
                      to: _details.to, // list of receivers
                      subject: "Bloom - You have been invited to a wedding!" // Subject line
                  };
                  templates.render('weddingInviteNotify.html', _details, function(err, html, text) {
                      mailOptions.html = html;
                      mailOptions.text = text;
                      mailOptions.attachment = attachment;

                      sendMail(mailOptions, function(error) {
                        if(error) {
                          failed.push(_details.id);
                          failCount++;
                        } else {
                          successCount++;
                        }
                      });
                  });
                }

                //Completion checker
                var completeCount = 0;

                var complete = {
                    init: function() {
                        complete.checkCompletion();
                    },
                    checkCompletion: function() {
                        if(guests.length === successCount + failCount) {
                          //completed, mail user
                          sendReportMail();
                        } else {
                          completeCount++;
                          if(completeCount >= 120) { //Timeout: 120 checks @ 1 per 5 sec -> 10 mins
                            //completed but timeout, mail user
                            sendReportMail();
                          } else {
                            setTimeout(complete.checkCompletion, 5000);
                          }
                        }
                    }
                }

                complete.init();

                // Mail user with invites sent report & missed invites list
                function sendReportMail () {
                  console.log("Wedding invites sent out successfully. Sending report mail");
                  //if any failed emails, create string from joining array
                  var failedEmailsStr = "";
                  var emailsFSub = "";
                  if(failed.length > 0) {
                    failedEmailsStr = failed.join(', ');
                    emailsFSub = "Please contact support with this list."
                  } else {
                    failedEmailsStr = "All invites were successfully sent.";
                  }

                  var reportDetails = {
                    name: name,
                    emailsCount: successCount,
                    emailsFailed: failedEmailsStr,
                    emailsFSub: emailsFSub,
                    attach: attachText
                  };

                  templates.render('weddingInviteReport.html', reportDetails, function(err, html, text) {
                      var mailOptions = {
                          from: bloom_support_address, // sender address
                          replyTo: bloom_support_address, //Reply to address
                          to: email, // list of receivers
                          subject: "Bloom - Your wedding invites report", // Subject line
                          html: html, // html body
                          text: text, //Text equivalent
                          attachment: attachment
                      };

                      sendMail(mailOptions, function() {
                        admin.database().ref('guestLists/' + snapshot.key).update({
                            completed: true
                        });

                        if(filepath) {
                          fs.unlink(filepath, function() {
                            console.log("PDF removed successfully");
                          });
                        }
                      });
                  });
                }
              }
            });


          });

        }

    });

    /*======================================================================*\
        If a guestListSd is created
    \*======================================================================*/
    admin.database().ref('guestListSds').on('child_added', function(snapshot) {

        var list = snapshot.val();

        if(list.completed === false || list.completed === 'false') {
          console.log("Save-The-Date invites created.");
          var id = snapshot.key;
          var details = list.details;
          var name = "";
          var email = "";

          admin.database().ref('weddings/' + id).once('value').then(function(_snapshot) {
            var wedding = _snapshot.val();
            let guests = wedding.guests;
            // var length = guests.length;
            var promiseArr = [];
            var count = 0;
            //for each guest do the following
            //Object.assign(obj1, obj2); to merge

            for (var key in guests) {
              if (guests.hasOwnProperty(key)) {

                promiseArr[count] = new Promise((resolve, reject) => {
                  var _id = key;
                  admin.database().ref('guests/' + _id).once('value').then(function(__snapshot) {
                    var guest = __snapshot.val();
                    var name = guest.name;
                    var email = guest.email;
                    var guest = {
                      id: _id,
                      name: name,
                      email: email
                    };
                    resolve(guest);
                  }, function(){
                    var failed = {
                      id: _id,
                      error: "Could not find guest"
                    };
                    resolve(failed);
                  });
                });
              }
              count++;
            }

            Promise.all(promiseArr).then((guests) => {

              var failed = [];
              var successCount = 0; //Check this + failed to match length and mail user
              var failCount = 0;

              var createPDF = new Promise((resolve, reject) => {
                var src = path.join(__dirname, "../../templates/saveDateDefault.pug");
                template = pug.compileFile(src, {
                    debug: false,
                    pretty: true
                });
                var filepath = path.join(__dirname, '../../datafiles/' + id + 'sd.pdf');
                pdf.create(template(details)).toFile(filepath, function(err, res) {
                  if (err) {
                    return reject(err);
                  }
                  resolve(res); // { filename: 'name.pdf' }
                });
              });

              var attachText = "";

              if(details.downloadURL) {
                googl.shorten(details.downloadURL)
                  .then(function (shortUrl) {
                      attachText = "Please view your invite here: " + shortUrl;
                      generateInvites();
                  })
                  .catch(function (err) {
                      console.error(err.message);
                      attachText = "Please view your invite here: " + details.downloadURL;
                      generateInvites();
                  });
              } else {
                createPDF.then((response)=>{
                  attachText = "Please see your invite attached";
                  console.log("PDF generated successfully");
                  generateInvites(response.filename);
                });
              }

              function generateInvites (filepath) {
                var attch;
                var attachment;
                details.attach = attachText;

                if(filepath) {
                  var data1 = fs.readFileSync(filepath);
                  attachment = new mailgun.Attachment({data: data1, filename: 'save-the-date.pdf'});
                }

                admin.database().ref('users/' + id).once('value').then(function(userSnapshot) {
                  var user = userSnapshot.val();
                  name = user.name;
                  email = user.email;

                  for (var i = 0; i < guests.length; i++) {
                    // do something with each guests[i]

                    // merge data
                    var detailsCopy = details;
                    Object.assign(detailsCopy, guests[i]);
                    detailsCopy.to = guests[i].email;
                    detailsCopy.id = userSnapshot.key;

                    renderInvite(JSON.parse(JSON.stringify(detailsCopy)));
                  }
                });

                function renderInvite (_details) {
                  var mailOptions = {
                      from: bloom_main_address, // sender address
                      replyTo: email, //Reply to address
                      to: _details.to, // list of receivers
                      subject: "Bloom - Save-the-date!" // Subject line
                  };
                  templates.render('saveDateNotify.html', _details, function(err, html, text) {
                      mailOptions.html = html;
                      mailOptions.text = text;
                      mailOptions.attachment = attachment;

                      sendMail(mailOptions, function(error) {
                        if(error) {
                          failed.push(_details.id);
                          failCount++;
                        } else {
                          successCount++;
                        }
                      });
                  });
                }

                //Completion checker
                var completeCount = 0;

                var complete = {
                    init: function() {
                        complete.checkCompletion();
                    },
                    checkCompletion: function() {
                        if(guests.length === successCount + failCount) {
                          //completed, mail user
                          sendReportMail();
                        } else {
                          completeCount++;
                          if(completeCount >= 120) { //Timeout: 120 checks @ 1 per 5 sec -> 10 mins
                            //completed but timeout, mail user
                            sendReportMail();
                          } else {
                            setTimeout(complete.checkCompletion, 5000);
                          }
                        }
                    }
                }

                complete.init();

                // Mail user with invites sent report & missed invites list
                function sendReportMail () {
                  console.log("Save-the-date invites sent out successfully. Sending report mail");
                  //if any failed emails, create string from joining array
                  var failedEmailsStr = "";
                  var emailsFSub = "";
                  if(failed.length > 0) {
                    failedEmailsStr = failed.join(', ');
                    emailsFSub = "Please contact support with this list."
                  } else {
                    failedEmailsStr = "All invites were successfully sent.";
                  }

                  var reportDetails = {
                    name: name,
                    emailsCount: successCount,
                    emailsFailed: failedEmailsStr,
                    emailsFSub: emailsFSub,
                    attach: attachText
                  };

                  templates.render('saveDateReport.html', reportDetails, function(err, html, text) {
                      var mailOptions = {
                          from: bloom_support_address, // sender address
                          replyTo: bloom_support_address, //Reply to address
                          to: email, // list of receivers
                          subject: "Bloom - Your save-the-date invites report", // Subject line
                          html: html, // html body
                          text: text, //Text equivalent
                          attachment: attachment
                      };

                      sendMail(mailOptions, function() {
                        admin.database().ref('guestListSds/' + snapshot.key).update({
                            completed: true
                        });
                        if(filepath) {
                          fs.unlink(filepath, function() {
                            console.log("PDF removed successfully");
                          });
                        }
                      });
                  });
                }
              }
            });


          });

        }

    });

    /*======================================================================*\
        If an inner circle invite is created
    \*======================================================================*/
    admin.database().ref('innerCircleInvites').on('child_added', function(snapshot) {

        var invite = snapshot.val();

        var acceptUrl = "https://bloomweddings.co.za/favourites/innercircle?accept=" + invite.userId;

        var details = {
            name: invite.name,
            _name: invite.sender,
            imgUrl: invite.imgUrl,
            acceptUrl: acceptUrl
        };

        if (true) { // Edit preferences will change this
            templates.render('innerCircleInvite.html', details, function(err, html, text) {
                var mailOptions = {
                    from: bloom_main_address, // sender address
                    replyTo: bloom_main_address, //Reply to address
                    to: invite.emailId, // list of receivers
                    subject: "Bloom - Inner Circle Invite", // Subject line
                    html: html, // html body
                    text: text //Text equivalent
                };

                sendMail(mailOptions, function() {

                });
                // send mail with defined transport object
                // transporter.sendMail(mailOptions, function(error, info) {
                //     if (error) {
                //         console.log("NO INVITE EMAIL ASSOCIATED");
                //         return console.log(error);
                //     }
                //     console.log('Message sent: ' + info.response);
                // });
                //console.log("was going to send a mail, inner circle invite");
            });

        }

    });

    /*======================================================================*\
        If a cat-item is deleted, removed favourites from users, remove
        from provinces and categories
    \*======================================================================*/
    admin.database().ref('catItems').on('child_removed', function(snapshot) {
        var item = snapshot.val(); //the deleted item
        var favouritedBy = item.favouritedBy; //list of users who favourited the item
        var fkey = snapshot.key; //key of the deleted item
        //Iterate through all users
        for (var key in favouritedBy) {
            if (favouritedBy.hasOwnProperty(key)) {
                //Get the user
                admin.database().ref('users/' + key).once('value').then(function(_snapshot) {
                    var _user = _snapshot.val();
                    var favourites = _user.favourites;
                    delete favourites[fkey]; //Delete favourite key-value pair
                    admin.database().ref('users/' + key).update({
                        favourites: favourites
                    });
                });
            }
        }

        //Remove cat-item from assigned category and province

        var assignedCategory = item.category;
        //Get the category
        admit.database().ref('categories/' + assignedCategory).once('value').then(function(_snapshot) {
            var cat = _snapshot.val();
            var catItems = cat.catItems;
            delete catItems[fkey]; //Delete cat-item key-value pair
            admin.database().ref('categories/' + assignedCategory).update({
                catItems: catItems
            });
        });

        var assignedProvince = item.province;
        //Get the Province
        admit.database().ref('provinces/' + assignedProvince).once('value').then(function(_snapshot) {
            var prov = _snapshot.val();
            var catItems = prov.catItems;
            delete catItems[fkey]; //Delete cat-item key-value pair
            admin.database().ref('provinces/' + assignedProvince).update({
                catItems: catItems
            });
        });
    });

    /*======================================================================*\
        If a wedding is deleted, remove tasks and guests
    \*======================================================================*/
    admin.database().ref('weddings').on('child_removed', function(snapshot) {
        var item = snapshot.val(); //the deleted item
        var assignedTasks = item.tasks; //list of tasks

        //Iterate through all tasks
        for (var key in assignedTasks) {
            if (assignedTasks.hasOwnProperty(key)) {
                //Get the task
                var del_ref = admin.database().ref('tasks/' + key);
                del_ref.remove();
            }
        }

        var assignedGuests = item.guests; //list of guests

        //Iterate through all tasks
        for (var key in assignedGuests) {
            if (assignedGuests.hasOwnProperty(key)) {
                //Get the task
                var del_ref = admin.database().ref('guests/' + key);
                del_ref.remove();
            }
        }
    });

    /* DEPRECATED */
    /*function sendMail (mailOptions, callback) {
        var mail = mailcomposer(mailOptions);

        if(mailOptions.to) {
          if(validateEmail(mailOptions.to)){
            mail.build(function(mailBuildError, message) {

                var dataToSend = {
                    to: mailOptions.to,
                    message: message.toString('ascii')
                };

                mailgun.messages().sendMime(dataToSend, function(sendError, body) {
                    if (sendError) {
                        console.log(sendError);
                        return;
                    } else {
                        console.log("Message sent to Mailgun: " + body.message);
                        if(mailOptions.attachment) {
                          console.log("Attachment found");
                          sendMailJustAttachment(mailOptions, function () {
                            callback();
                          });
                        } else {
                          callback();
                        }
                    }

                });
            });
          } else {
            console.log("Message blocked, invalid email address: " + mailOptions.to);
          }
        } else {
          console.log("Message blocked, no email address");
        }

    } */

    /* DEPRECATED */
    /*
    function sendMailJustAttachment (mailOptions, callback) {
      var data = {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: "You have an attachment from Bloom",
        text: "Please find your attachment in this email",
        attachment: mailOptions.attachment
      };

      mailgun.messages().send(data, function (error, body) {
        console.log("Message sent to Mailgun: " + body.message);
        callback();
      });
    } */

    function sendMail (mailOptions, callback) {
      if(mailOptions.to) {
        if(mailOptions.to === bloom_support_address ? true : validateEmail(mailOptions.to)){

              var data = {
                from: mailOptions.from,
                to: mailOptions.to,
                replyTo: mailOptions.replyTo,
                subject: mailOptions.subject,
                html: mailOptions.html,
                text: mailOptions.text,
                attachment: mailOptions.attachment
              };

              mailgun.messages().send(data, function (error, body) {
                console.log("Message sent to Mailgun: " + body.message);
                callback();
              });
        } else {
          var err = "Invalid email address: " + mailOptions.to;
          console.log("Message blocked. " + err);
          callback(err);
        }
      } else {
        var err = "No email address";
        console.log("Message blocked. " + err);
        callback(err);
      }
    }

    function validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }


}

module.exports = {
    init: init
};
