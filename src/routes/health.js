const express = require('express');

const router = express.Router();

/* GET healthCheck */
router.get('/', function (req, res) {
    res.sendStatus(200);
});

module.exports = router;
