const express = require('express')
const router = express.Router()
const moment = require('moment')
const today = moment();
const todayString = today.format("DDDD d MMMM YYYY")


// keep this updated with the names of further CAZs
var cazs = ['birmingham', 'leeds']


function formatVrn(vrn) {
  return vrn.toUpperCase().replace(/\s/g, '');
}

function calculateCharge(vrn, vehicleType, caz) {
  if (vrn == 'DEF789' || vrn == 'JKL987' || vehicleType == 'HGV' || vehicleType == "busCoach" || caz == "leeds-weekly"){
      return 50.00;
  } else if (caz == "leeds") {
    return 12.50;
  } else if (caz == "birmingham") {
    return 8;
  }
}

// ** PAYMENT ROUTES ** //

// Enter vehicle details
router.post('/confirm-vehicle-details', function (req, res) {
    var countryRegistered = req.body['country-of-registration'];
    var vrn = req.session.data['vrn'];
    // Remove spacing and make letters uppercase
    var formattedVrn = vrn.toUpperCase().replace(/\s/g, '');


    if (countryRegistered == "non-uk") {

        res.redirect('/payments/non-uk-vehicle')

    } else if (formattedVrn == "XYZ456") {

        res.redirect('/payments/unrecognised-vehicle')

    } else if (formattedVrn == "") {

        res.render('payments/enter-vehicle-details', {
            error: true,
            errorMessage: "Enter a registration number (also known as license plate number)"
        })

    } else {

        res.redirect('/payments/confirm-vehicle-details')

    }

});

// Confirm vehicle details page
router.post('/payments/confirm-vehicle', function (req, res) {
    var confirm = req.body['confirm-vehicle'];
    var vrn = formatVrn(req.session.data['vrn']);

    if (confirm == 'yes') {
        if (vrn == "CDE345") {
            res.redirect('/payments/compliant-vehicle')
        }
        res.redirect('/payments/local-authority')
    } else if (confirm == 'no') {
        res.redirect('/payments/incorrect-details')
    } else {
        res.render('payments/confirm-vehicle-details', {
            error: true,
            errorMessage: "Answer yes or no"
        })
    }
});

// Local Authority selection page (from unrecognised vehicles page)
router.post('/payments/localAuthority', function (req, res) {
  if (req.session.data['overseas'] == "correct-details") {
      res.redirect('/payments/local-authority')
  } else {
    res.render('payments/unrecognised-vehicle', {
      error: true,
      errorMessage: "Confirm that the registration number is correct"
    })
  }
});

// Local Authority selection page
router.get('/payments/caz', function (req, res) {
  var caz = req.session.data['caz'];

  if (caz == "leeds-weekly") {
    res.redirect('/payments/leeds-weekly-charge');
  } else {
    res.redirect('/payments/' + caz)
  }
});

// Router to date selection or payment period selection page
router.post('/payments/paymentPages', function (req, res) {
  var confirm = req.body['caz'];
  var vrn = formatVrn(req.session.data['vrn']);

  if (confirm == undefined) {
    res.render('payments/local-authority', {
      error: true,
      errorMessage: "State which Clean Air Zone you are paying for"
    })
  } else if (confirm == "leeds" && vrn == "ABC123") {
    res.redirect('/payments/select-period')
  } else {
    res.redirect('/payments/' + confirm)
  }
});

// Birmingham Charge page
router.post('/payments/birmingham', function (req, res) {
    var confirm = req.body['confirm'];
    var vrn = formatVrn(req.session.data['vrn']);
    if (confirm == '_unchecked') {
        res.render('payments/birmingham', {
            error: true,
            errorMessage: "Confirm you have checked if you are eligible for an exemption"
        })
    } else if (vrn == "GR3Y0UT") {
        res.redirect('/payments/select-date-disabled')
    } else if (vrn == "REM0VE") {
        res.redirect('/payments/select-date-remove')
    } else {
        res.redirect('/payments/select-date')
    }
});

// Leeds Charge page - checked exemption
router.post('/payments/leeds', function (req, res) {
  var confirm = req.body['confirm'];

  if (confirm == '_unchecked'){
    res.render('payments/leeds', {
      error: true,
      errorMessage: "Confirm you have checked if you are eligible for an exemption"
    })
  } else {
    res.redirect('/payments/select-date')
  }
});

// Unrecognised Vehicle - confirm details
router.post('/payments/unrecognised-vehicle', function (req, res) {
  var confirm = req.body['confirm'];

  if (confirm == '_unchecked'){
    res.render('payments/unrecognised-vehicle', {
      error: true,
      errorMessage: "Confirm your registration number is correct"
    })
  } else {
    res.redirect('/payments/choose-vehicle')
  }
});

// Payment period selection page
router.post('/payments/paymentPagesSelectPeriod', function (req, res) {
  var period = req.body['period'];

  if (period == undefined) {
      res.render('payments/select-period', {
        error: true,
        errorMessage: "State if you are paying for 1 day or 7 days"
      })
    } else if (period == "daily-charge") {
      res.redirect('/payments/leeds')
    } else if (period == "weekly-charge") {
      res.redirect('/payments/leeds-weekly-charge')
    }

});

// Date selection page
router.get('/payments/select-date', function (req, res) {
  var caz = req.session.data['caz'];

  res.render('payments/select-date', {
    amountDue: req.session.amountDue,
    caz: caz,
    today: today
  });
});

router.post('/payments/select-date', function (req, res) {
  var caz = req.session.data['caz'];

  res.render('payments/select-date', {
    amountDue: req.session.amountDue,
    caz: caz,
    today: todayString
  });
});

// Payment period selection page (Leeds weekly charge)
router.get('/payments/select-date-weekly', function (req, res) {
  res.render('payments/select-date-weekly', {
    amountDue: req.session.amountDue,
    caz: req.session.data['caz'],
    today: today,
    vrn: req.session.data['vrn']
  });
});

router.post('/payments/select-date-weekly', function (req, res) {
  res.render('payments/select-date-weekly', {
    amountDue: req.session.amountDue,
    caz: req.session.data['caz'],
    today: today,
    vrn: req.session.data['vrn']
  });
});

// Router to retrieve correct date selection page
router.get('/payments/selectDate', function (req, res) {
  var caz = req.session.data['caz'];

  if (caz == "leeds-weekly") {
    res.render('payments/select-date-weekly', {
      amountDue: req.session.amountDue,
      caz: caz,
      today: todayString,
      vrn: vrn
    });
  } else {
    res.render('payments/select-date', {
      amountDue: req.session.amountDue,
      caz: caz,
      today: todayString
    });
  }
});

router.post('/payments/selected-date', function (req, res) {
    if (!req.session.data['vrn']) {
      res.redirect('/')
    }
    var caz = req.session.data['caz'];
    var vrn = req.session.data['vrn'];
    var vehicleType = req.session.data['vehicle-type'];

    // Remove spacing and make letters uppercase
    var formattedVrn = formatVrn(vrn);

    // Date stuff
    var dates = req.body['date'];
    req.session.data['singledates'] = dates;
     
    charge = calculateCharge(formattedVrn, vehicleType, caz);
    // charge = caz === 'leeds-weekly' ? charge : charge * dates.length;
    charge = charge * dates.length;
    req.session.amountDue = '£' + charge.toFixed(2);

  
    // var selectedDates = dates.join(', ');
    if (req.session.data['date'] == undefined) {
        res.render('payments/select-date', {
            error: true,
            errorMessage: "Select a date that you wish to pay for",
            today: today
        })
    } else if (req.session.data['vrn'] == 'ERR0R' || req.session.data['vrn'] == 'err0r') {
        res.render('payments/select-date-error', {
            error: true,
            errorMessage: "The charge has been paid for the following dates. Select another date to pay and continue.",
            today: today
        })
    } else {
      res.render('payments/confirm-charge', {
        amountDue: req.session.amountDue, 
        dates: dates, 
        caz: caz,
        vrn: formattedVrn
      });
    }
  
  });

  router.post('/payments/selected-date-taxi', function (req, res) {
    if (!req.session.data['vrn']) {
      res.redirect('/')
    }
    var caz = req.session.data['caz'];
    var vrn = req.session.data['vrn'];
    var vehicleType = req.session.data['vehicle-type'];

    // Remove spacing and make letters uppercase
    var formattedVrn = formatVrn(vrn);

    // Date stuff
    var dates = [req.body['date2']]; 
    dates.unshift(req.session.data['first-date']);
    req.session.data['dateArray'] = dates;
     
    charge = calculateCharge(formattedVrn, vehicleType, caz);
    // charge = caz === 'leeds-weekly' ? charge : charge * dates.length;
    charge = charge * dates.length;
    req.session.amountDue = '£' + charge.toFixed(2);

  
    // var selectedDates = dates.join(', ');
    if (req.session.data['date'] == undefined) {
        res.render('payments/select-date', {
            error: true,
            errorMessage: "Select a date that you wish to pay for",
            today: today
        })
    } else if (req.session.data['vrn'] == 'ERR0R' || req.session.data['vrn'] == 'err0r') {
        res.render('payments/select-date-error', {
            error: true,
            errorMessage: "The charge has been paid for the following dates. Select another date to pay and continue.",
            today: today
        })
    } else {
      res.render('payments/confirm-charge', {
        amountDue: req.session.amountDue, 
        dates: dates, 
        caz: caz,
        vrn: formattedVrn
      });
    }
  
  });
  
  // Router to correct payment method page
  router.get('/payments/selected-date', function (req, res) {
    if (!req.session.data['vrn']) {
        res.redirect('/')
      }
      var caz = req.session.data['caz'];
      var vrn = req.session.data['vrn'];
      var vehicleType = req.session.data['vehicle-type'];
  
      // Remove spacing and make letters uppercase
      var formattedVrn = formatVrn(vrn);
  
      // Date stuff
      console.log(req.session.data['date2']);
      if (req.session.data['date2'] != undefined){
      var dates = [req.body['date2']]; 
      dates.unshift(req.session.data['first-date']);
      req.session.data['dateArray'] = dates;
      console.log(dates);
      console.log('if')
    } else {
        var dates = [req.session.data['first-date']]
        req.session.data['dateArray']=dates;
        console.log('else')
    }
      
       
      charge = calculateCharge(formattedVrn, vehicleType, caz);
      // charge = caz === 'leeds-weekly' ? charge : charge * dates.length;
      charge = charge * dates.length;
      req.session.amountDue = '£' + charge.toFixed(2);
  
    
      // var selectedDates = dates.join(', ');
      if (req.session.data['date'] == undefined) {
          res.render('payments/select-date', {
              error: true,
              errorMessage: "Select a date that you wish to pay for",
              today: today
          })
      } else if (req.session.data['vrn'] == 'ERR0R' || req.session.data['vrn'] == 'err0r') {
          res.render('payments/select-date-error', {
              error: true,
              errorMessage: "The charge has been paid for the following dates. Select another date to pay and continue.",
              today: today
          })
      } else {
        res.render('payments/confirm-charge', {
          amountDue: req.session.amountDue, 
          dates: dates, 
          caz: caz,
          vrn: formattedVrn
        });
      }
    
    });

router.get('/payments/debit-credit-card', function (req, res) {
  res.render('payments/debit-credit-card', {amountDue: req.session.amountDue});

});

router.post('/payments/debit-credit-card', function (req, res) {
  res.render('payments/debit-credit-card', {amountDue: req.session.amountDue});
});

// Payment confirmation page

router.get('/payments/confirm-payment', function (req, res) {
  if (!req.session.data['vrn']) {
    res.redirect('/')
  }
  var caz = req.session.data['caz'];
  var dates = req.session.data['dateArray'];
  var vrn = formatVrn(req.session.data['vrn']);


  res.render('payments/confirm-payment', {
    amountDue: req.session.amountDue, 
    dates: dates, 
    caz: caz, 
    vrn: vrn
  });

});

// router.post('/payments/confirm-payment', function (req, res) {
//   if (!req.session.data['vrn']) {
//     res.redirect('/')
//   }
//   var email = req.session.data['email'];
//   var caz = req.session.data['caz'];
//   if (req.session.data['dateArray'] == undefined){
//       req.session.data['dateArray'] = req.session.data[['singledates']];
//       console.log('confirm if statement');
//   }
//   var dates = req.session.data['dateArray'];
//   var vrn = formatVrn(req.session.data['vrn']);
//   var vehicleType = req.session.data['vehicle-type'];
   
//   charge = calculateCharge(vrn, vehicleType, caz);
//   charge = charge * dates.length;
//   req.session.amountDue = '£' + charge.toFixed(2);
//   var localAuthority = caz === "leeds-weekly" ? "Leeds" : caz.charAt(0).toUpperCase() + caz.slice(1);

//   if (email != "") {
//     format = "dddd D MMMM YYYY";
//     emailDate = caz === 'leeds-weekly' ? moment(dates).format(format) : dates.map(d => moment(d).format(format));
//   }

//   res.render('payments/confirm-payment', {
//     amountDue: req.session.amountDue, 
//     dates: dates, 
//     localAuthority: localAuthority,
//     caz: caz,
//     vrn: vrn
//   });

// });

router.post('/payments/confirm-payment-details', function (req, res) {
  var error = false;

  // Card number validation
  var inputs = {
    cardNumber: req.session.data['card-number'],
    cardName: req.session.data['card-name'],
    month: req.session.data['expiry-month'],
    year: req.session.data['expiry-year'],
    securityCode: req.session.data['card-code'],
    country: req.session.data['country'],
    buildingNumber: req.session.data['building-number'],
    town: req.session.data['town'],
    postcode: req.session.data['postcode']
  }

  var errorMessages = {
    cardNumberErrorMessage: "Enter a card number",
    cardNameErrorMessage: "Enter the name of the cardholder",
    monthErrorMessage: "Enter a valid month",
    yearErrorMessage: "Enter a valid date using only 2 characters",
    securityCodeErrorMessage: "Enter a 3-digit security code. You can find this on the security strip at the back of your card",
    countryErrorMessage: "Enter your country or territory",
    buildingNumberErrorMessage: "Enter a building number and name or street",
    townErrorMessage: "Enter a town or city",
    postcodeErrorMessage: "Enter a postcode"
  }

  var errs = {
    cardNumberError: inputs.cardNumber === "",
    cardNameError: inputs.cardName === "",
    monthError: inputs.month === "",
    yearError: inputs.year === "",
    securityCodeError: inputs.securityCode === "",
    countryError: inputs.country === "",
    buildingNumberError: inputs.buildingNumber === "",
    townError: inputs.town === "",
    postcodeError: inputs.postcode === ""
  }

  error = Object.values(errs).filter(Boolean).length;
  if (error) {

    vars = Object.assign(errorMessages, errs, inputs, {
      amountDue: req.session.amountDue,
      error: true
    });

    res.render('payments/debit-credit-card', vars);

  } else {
    res.render('payments/confirm-payment-details', {
      amountDue: req.session.amountDue,
      cardNumber: '*'.repeat(12) + '1234'
    });
  }  
});

router.get('/payments/confirm-payment-details', function (req, res) {
  res.render('payments/confirm-payment-details', {
    amountDue: req.session.amountDue,
    cardNumber: '*'.repeat(12) + '1234',
    data: req.session.data
  });
});


// ** FLEET ROUTES ** //

// Company user - add user
router.get('/fleets/company-user/add-users', function(req, res) {
  if (req.query.email) {
    var users = req.session.users.filter(function( user ) {
      return user.email !== req.query.email;
    });
    req.session.users = users;
  }

  res.render('fleets/company-user/add-users', {
    name: req.query.name,
    email: req.query.email
  })
})

// Company user - manage users
router.get('/fleets/company-user/user-added/', function(req, res) {
  if (req.query.email) {
    var users = req.session.users.filter(function( user ) {
      return user.email !== req.query.email;
    });
    req.session.users = users;
  }

  res.render('fleets/company-user/user-added', {
    users: req.session.users
  })
})

router.post('/fleets/company-user/user-added/', function(req, res) {
  var addUser = req.body['add-user'];
  var name = req.body['name'];
  var email = req.body['email'];
  
  if (name && email) {
    if (req.session.users) {
      req.session.users.push({'name':name,'email':email});
    } else {
      req.session.users = [{'name':name,'email':email}];
    }
  }
  
  if (addUser == 'yes') {
    res.redirect('/fleets/company-user/add-users');
  } else if (addUser === 'no') {
    res.redirect('/fleets/company-user/account-set-up');
  } else {
    res.redirect('/fleets/company-user/user-added');
  }
})

// Fleet account login
router.post('/fleets/single-user/login', function (req, res) {
  var username = req.body['username'];
  var password = req.body['password'];

  if (username == '' || password == ''){
    res.render('fleets/single-user/login', {
      error: true,
      errorMessage: "Please enter your username and password"
    })
  } else if (username=='manager') {
      res.redirect('/fleets/organisation-account/dashboard')
  } else if (username != '' && password != ''){
    res.redirect('/fleets/single-user/fleet-account')
  }  else {
    res.render('fleets/single-user/login', {
      error: true,
      errorMessage: "Invalid username or password"
    })
  }
});

// Forgotten Fleet account login
router.post('/fleets/single-user/fleet-account-forgotten-password', function (req, res) {
  var email = req.body['email'];

  if (email == ''){
    res.render('fleets/single-user/fleet-account-forgotten-password', {
      error: true,
      errorMessage: "Please enter an email address"
    })
  } else {
    res.redirect('/fleets/single-user/fleet-account-forgotten-password')
  }
});

// Fleets redirect if no vehicles

router.get('/fleets/single-user/select-caz', function(req, res) {
    if (req.session.vrns && req.session.vrns.length > 0) {
      res.render('fleets/single-user/select-caz');
    } else {
      res.redirect('first-upload');
    }
  })

router.post('/fleets/single-user/fleet-direct-debit-mandate', function (req, res) {
  const mandateVar = {
    'caz': req.session.data['DDcaz'],
    'mandateId': [...Array(23)].map(i=>(~~(Math.random()*36)).toString(36)).join(''),
    'status': 'Active',
  }
  if (req.session.mandate) {
    req.session.mandate.push(mandateVar);
  } else {
    req.session.mandate = [mandateVar];
  }

  res.render('fleets/single-user/fleet-direct-debit-mandate')
})

// Fleets view direct debit mandates
router.get('/fleets/single-user/view-direct-debit', function(req, res) {
  res.render('fleets/single-user/view-direct-debit', {
    'mandate': req.session.mandate
  })
})

router.post('/fleets/single-user/view-direct-debit', function(req, res) {
  res.render('fleets/single-user/view-direct-debit', {
    'mandate': req.session.mandate
  })
})

// Fleets select direct debit
router.get('/fleets/single-user/select-direct-debit', function(req, res) {
  if (req.session.mandate && req.session.mandate.length > 0) {
    for (var m in req.session.mandate) {
      var caz = req.session.mandate[m].caz.toString();
      cazs = cazs.filter(e => e !== caz);
    }
  }
  res.render('fleets/single-user/select-direct-debit', {
    'cazs': cazs
  })
})

router.post('/fleets/single-user/select-direct-debit', function(req, res) {
  if (req.session.mandate && req.session.mandate.length > 0) {
    for (var m in req.session.mandate) {
      var caz = req.session.mandate[m].caz.toString();
      cazs = cazs.filter(e => e !== caz);
    }
  }
  res.render('fleets/single-user/select-direct-debit', {
    'cazs': cazs
  })
})

// Fleet-select-payment
router.post('/fleets/single-user/choose-payment-method', function (req, res) {
  var payment_type = req.body['payment-type'];

  if (payment_type == 'direct-debit'){
    if ('mandate' in req.session) {
      res.redirect('confirm-charge-direct-debit')
    }
    else {
      res.redirect('first-mandate')
    }    
  } else if (payment_type == 'card-payment'){
    res.redirect('fleet-debit-credit-card')
  } else {
    res.render('fleets/single-user/choose-payment-method', {
      error: true,
      errorMessage: "Please enter a prefered payment type"
    })
  }
});

// Fleet account sign out
router.get('/payments/logout', function(req, res) {
  req.session.data = null;
  res.redirect('sign-out');
})

// account dashboard
router.get('/fleets/single-user/fleet-account', function(req, res) {
  var registered = true ? req.session.data['registered'] === 'true' : false;
  var vehicles = 'vrns' in req.session ? req.session.vrns.length : 0;
  var direct_debit = 'mandate' in req.session;
  
  res.render('fleets/single-user/fleet-account', {
    registered: registered,
    vrns: req.session.vrns,
    vehicles: vehicles,
    direct_debit: direct_debit
  })
})

router.post('/fleets/single-user/fleet-account', function(req, res) {
  req.session.vrns = ['AB12CDE','AF03WMY','BT02VYL','JO51WQE','M15JIK','M56FGF','MH75BJH','P057BOX','R66PPR','WL08JTZ'];
  res.redirect('/fleets/single-user/fleet-account')
})

// update the fleet - get
router.get('/fleets/single-user/fleet-update', function(req, res) {  
  if (req.query.vrn) {
    var vrns = req.session.vrns.filter(function( vrn ) {
      return vrn !== req.query.vrn;
    });
    req.session.vrns = vrns;
  }

  var registered = true ? req.session.data['registered'] === 'true' : false;
  res.render('fleets/single-user/fleet-update', {
    registered: registered,
    vrns: req.session.vrns
  })
})

router.post('/fleets/single-user/fleet-update', function(req, res) {  
    
    if (req.session.data['remove'] == 'yes') {
        if (req.query.vrn) {
            var vrns = req.session.vrns.filter(function (vrn) {
                return vrn !== req.query.vrn;
            });
            req.session.vrns = vrns;
        }
    }
  
    var registered = true ? req.session.data['registered'] === 'true' : false;
    res.render('fleets/single-user/fleet-update', {
      registered: registered,
      vrns: req.session.vrns
    })
  })

// upload fleet
router.post('/fleets/single-user/fleets-confirmation', function(req, res) {
  req.session.vrns = ['AB12CDE','AF03WMY','BT02VYL','JO51WQE','M15JIK','M56FGF','MH75BJH','P057BOX','R66PPR','WL08JTZ']
  res.redirect('fleet-update');
})

router.post('/fleets/single-user/fleets-reconfirmation', function(req, res) {
    req.session.vrns = ['M15JIK','M56FGF','MH75BJH','P057BOX','R66PPR','WL08JTZ','Z12TTP']
    res.redirect('fleet-update');
  })

// update the fleet - post
router.post('/fleets/single-user/fleet-update-add', function(req, res) {
  var ans = true ? req.session.data['add-vehicle'] === 'yes' : false;
  if (ans) {
    res.redirect('/fleets/single-user/add-vehicle');
  }
  else {
    res.redirect('/fleets/single-user/fleet-account');
  }
})

// fleets confirmation
router.get('/fleets/single-user/fleets-confirmation', function(req, res) {
  res.render('fleets/single-user/fleets-confirmation', {
    vrns: req.session.vrns
  })
})

// add a vehicle to a fleet
router.post('/fleets/single-user/add-vehicle', function(req,res) {
  var vrn = req.session.data['vrn'];
  if (vrn) {
    if (req.session.vrns) {
      req.session.vrns.push(vrn);
    }
    else {
      req.session.vrns = [vrn];
    }
  }
  res.redirect('/fleets/single-user/fleet-update');

})

router.post('/fleets/organisation-account/add-user', function(req, res) {
    var ans = true ? req.session.data['add-user'] === 'yes' : false;
    if (ans) {
      res.redirect('/fleets/organisation-account/add-user');
    }
    else {
      res.redirect('/fleets/organisation-account/dashboard');
    }
  })


  router.get('/add-vehicle-choice', function (req, res) {
    var addchoice = req.session.data['add-choice'];
  
    if (addchoice == "upload") {
      res.redirect('/fleets/single-user/csv-upload');
    } else if (addchoice == "manual") {
      res.redirect('/fleets/single-user/add-vehicle')
    }
  });

  router.get('/fleets/organisation-account/manage-users', function (req, res) {
    res.render('fleets/organisation-account/manage-users', {
        'users':  req.session.users});
    });

  router.post('/fleets/organisation-account/add-users', function(req,res) {
    var name = req.session.data['name'];
    var email = req.session.data['user-email'];
    if (name && email) {
        user = {"name": name, "email": email};
        if (req.session.users) {
            req.session.users.push(user);
        }
        else {
            req.session.users = [user];
        }
    }

    res.redirect('/fleets/organisation-account/user-add-confirmation');
  
  })

  router.get('/fleets/single-user/remove-confirm', function(req, res) {  
  
    res.render('fleets/single-user/remove-confirm', {
      vrn: req.query.vrn
    })
  })

  router.get('/fleets/single-user/confirm-vehicle', function(req, res) {  
  
    res.render('fleets/single-user/confirm-vehicle', {
      vrn: req.query.vrn
    })
  })


  router.post('/fleets/single-user/confirm-vehicle', function (req, res) {
    var confirm = req.body['confirm-vehicle'];

    if (confirm == 'yes') {
        
        res.redirect('/fleets/single-user/manage-vehicles')
    } 
});

//Leeds Weekly Taxi Radios
router.post('/payments/select-date-weekly-2x', function (req, res) {
    if (!req.session.data['vrn']) {
      res.redirect('/')
    }

    req.session.data['first-date']=req.body['date'];
    console.log(req.session.data['first-date']);

    var dateMinus6= today.subtract(6, 'd').format("ddd MMM DD YYYY");
    today.add(6, 'd');
    var dateMinus5= today.subtract(5, 'd').format("ddd MMM DD YYYY");
    today.add(5, 'd');
    var dateMinus4= today.subtract(4, 'd').format("ddd MMM DD YYYY");
    today.add(4, 'd');
    var dateMinus3= today.subtract(3, 'd').format("ddd MMM DD YYYY");
    today.add(3, 'd');
    var dateMinus2= today.subtract(2, 'd').format("ddd MMM DD YYYY");
    today.add(2, 'd');
    var dateMinus1= today.subtract(1, 'd').format("ddd MMM DD YYYY");
    today.add(1, 'd');
    var dateAdd1= today.add(1, 'd').format("ddd MMM DD YYYY");
    today.subtract(1, 'd');
    var dateAdd2= today.add(2, 'd').format("ddd MMM DD YYYY");
    today.subtract(2, 'd');
    var dateAdd3= today.add(3, 'd').format("ddd MMM DD YYYY");
    today.subtract(3, 'd');
    var dateAdd4= today.add(4, 'd').format("ddd MMM DD YYYY");
    today.subtract(4, 'd');
    var dateAdd5= today.add(5, 'd').format("ddd MMM DD YYYY");
    today.subtract(5, 'd');
    var dateAdd6= today.add(6, 'd').format("ddd MMM DD YYYY");
    today.subtract(6, 'd');

    var datestring = req.session.data['date'].toString();
    



    if (req.session.data['date'] == undefined) {
        res.render('/payments/select-date-weekly', {
            error: true,
            errorMessage: "Select a date that you wish to pay for",
            today: today
        })
    } else if (req.session.data['select-another'] == 'select-another') {

        if (datestring.includes(dateMinus6)) {
            console.log('1');
            var radio = 'minus6';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateMinus5)) {
            console.log('2');
            var radio = 'minus5';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateMinus4)) {
            console.log('3');
            var radio = 'minus4';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateMinus3)) {
            console.log('4');
            var radio = 'minus3';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateMinus2)) {
            console.log('5');
            var radio = 'minus2';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateMinus1)) {
            console.log('6');
            var radio = 'minus1';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateAdd6)) {
            console.log('7');
            var radio = 'add6';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateAdd5)) {
            console.log('8');
            var radio = 'add5';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateAdd4)) {
            console.log('9');
            var radio = 'add4';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateAdd3)) {
            console.log('10');
            var radio = 'add3';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateAdd2)) {
            console.log('11');
            var radio = 'add2';
            res.render('payments/select-date-weekly-2a', { radio });
        } else if (datestring.includes(dateAdd1)) {
            console.log('12');
            var radio = 'add1';
            res.render('payments/select-date-weekly-2a', { radio });
        } 
    } else {
        req.session.data['date2']=undefined;
        res.redirect('/payments/selected-date');
    }

    


});


router.post('/taxi-search', function (req, res) {
    var historic = req.body['historic'];
    // Remove spacing and make letters uppercase


    if (historic == "historical") {

        res.redirect('/historic-search')

    } else {

        res.redirect('/nonhistoric-search')

    }

});

router.post('/payments/initial-weekly-question-route', function (req, res) {
    var initialWeekly = req.body['initial-weekly'];
    // Remove spacing and make letters uppercase


    if (initialWeekly == "today") {

        res.redirect('/payments/confirm-charge-week-today')

    } else {

        res.redirect('/payments/select-date-weekly')

    }

});

module.exports = router