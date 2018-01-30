var express = require('express');
var router = express.Router();
var bot = require('../bot/telegram.bot');

router.post('/bot',(req,res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

module.exports = router;