const express = require('express')
const router = express.Router()
var vrn;

// add another vehicle question
router.post('/offline-payments/add-another-vehicle-question-route', function (req, res) {
    var addAnother = req.body['add-another'];

    if (addAnother != 'no') 
    {
        res.redirect('/offline-payments/enter-vehicle-details')
    } 
    else
    {
        res.redirect('/offline-payments/check-all-answers')
    }
});

// confirm vehicle details question
router.post('/offline-payments/confirm-vehicle-details-route', function (req, res) {
    var confirmDetails = req.body['confirm-vehicle'];

    if (confirmDetails != 'no') 
    {
        if (vrn == 'ABC123')
        {
            res.redirect('/offline-payments/charge-period')
        }
        else 
        {
            res.redirect('/offline-payments/tariff-page')
        }
        
    } 
    else
    {
        res.redirect('/offline-payments/incorrect-details')
    }
});

// enter vehicle details question
router.post('/offline-payments/enter-vehicle-details-route', function (req, res) {
    var country = req.body['country-of-registration'];
    vrn = req.body['vrn']

    if (country != 'non-uk') 
    {
        res.redirect('/offline-payments/confirm-vehicle-details')
    } 
    else
    {
        res.redirect('/offline-payments/confirm-correct-vrn')
    }
});

// charge period question
router.post('/offline-payments/charge-period-route', function (req, res) {
    var period = req.body['period'];

    if (period != 'daily') 
    {
        res.redirect('/offline-payments/weekly-tariff-page')
        
    } 
    else
    {
        res.redirect('/offline-payments/tariff-page')
    }
});

module.exports = router