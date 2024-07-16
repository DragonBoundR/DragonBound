var express = require('express'),
    router = express.Router();

router.post('/', async (req, res) => {
    const { username, pass } = req.body;
    const sendError = () => {
        res.render('login', { error: true });
    }
    try {
        const responseUsername = await req.db.getAccountByUsername(username);
        const currentUsername = await responseUsername[0][0];
        if (currentUsername.Password === pass) {
            const responseUserById = await req.db.getUserByIdAcc(currentUsername.Id);
            const dataUserById = await responseUserById[0][0];
            if (responseUserById[0].length > 0) {
                req.session.cookie.expires = false;
                req.session.cookie.maxAge = new Date(Date.now() + (60 * 1000 * 1440));
                req.session.account_id = currentUsername.Id;
                req.session.rank = dataUserById.rank;
                req.session.acc_session = currentUsername.Session;
                req.session.game_id = dataUserById.game_id;
                res.redirect('user/' + dataUserById.game_id);
            } else {
                sendError();
            }
        } else {
            sendError();
        }
    }
    catch (ex) {
        sendError();
    }

});

module.exports = router;