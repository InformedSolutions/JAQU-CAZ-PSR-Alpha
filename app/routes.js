const express = require('express')
const router = express.Router()

// add another vehicle question
router.post('/offline-payments/add-another-vehicle-question-route', function (req, res) {
    var addAnother = req.body['add-another'];

    if (addAnother != 'yes') 
    {
        res.redirect('no')
    } 
    else
    {
        res.redirect('yes')
    }
});

module.exports = router