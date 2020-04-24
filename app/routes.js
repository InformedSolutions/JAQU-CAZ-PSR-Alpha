const express = require('express')
const router = express.Router()

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

module.exports = router