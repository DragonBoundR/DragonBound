var express = require('express'),
    router = express.Router(),
    nodemailer = require('nodemailer');

// metodo de server - GET
// Muestra algo
// ruta account/password/resetPass
router.get('/login', function (req, res) {
    // renderizar una plantilla html
    res.render('login.handlebars');
});
module.exports = router;