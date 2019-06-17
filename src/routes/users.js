const express = require('express');
const csController = require('../controller/CsController');

const router = express.Router();

const handleLogin = async (req, res, next) => {
    const username = req.body.username; 
    const displayName = req.body.displayName; 

    try {
        const response = await csController.createUser(username, displayName);
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const response = await csController.getUsers(); 
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

/* POST user login */
router.post('/', handleLogin);
/* GET users */ 
router.get('/', getUsers); 

module.exports = router;
