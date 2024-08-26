var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var Logger = require('./game/lib/logger');
var DataBase = require('./game/database');
var session = require('express-session');
var { exec } = require('child_process');

var hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, "/web/views/layouts"),
    partialsDir: [
        '/web/views/partials/'
    ]
});

var db = new DataBase();
var options = {
    host: db.host,
    port: 3306,
    user: db.user,
    password: db.password,
    database: db.database,
    schema: {
        tableName: 'account_sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires_time',
            data: 'data_acc'
        }
    }
};
var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore(options);
var http = require('http').createServer();
this._httpServer = http;
this._app = express(); // Initialize Express app
this._app.engine('handlebars', hbs.engine);
this._app.set('view engine', 'handlebars');
this._app.set('views', path.join(__dirname, "/web/views"));
this._app.use(session({
    key: 'sessionid',
    secret: 'abc-xgamedev',
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: new Date(Date.now() + (100 * 1000 * 10))
    }
}));
this._app.use(cookieParser('xgamedev'));
this._app.use(bodyParser.urlencoded({ extended: false }));
this.pin_code = []; 
this._app.use(function(req, res, next) {
    req.db = db;
    try {
        next();
    } catch (e) {
        Logger.debug("err: " + e.stack);
        res.status(403);
    }
});
this._app.use(bodyParser.json());
this._app.use('/static', express.static(path.join(__dirname + '/web/public_html/data')));
this._app.use(require('./web/middlewares/account'));
this._app.use(require('./web/controllers'));

http.on('request', this._app);

http.listen(80, function() {
    var st = process.env.vps == '1' ? 'VPS' : 'LOCAL';
    Logger.normal('Listening on ' + st + " " + http.address().port);
});

let remainingTime = 1800000; // Initial remaining time (30 minutes)
let lastUpdateTime = Date.now(); // Initial last update time

// Function to run the rankingscript.js
function runRankingScript() {
    const scriptPath = path.join(__dirname, 'game', 'rankingscript.js');
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Script error output: ${stderr}`);
            return;
        }
        console.log(`\nScript output: ${stdout}`);
    });
}

// Function to start the countdown
function startCountdown(duration) {
    remainingTime = duration;
    const countdownInterval = setInterval(() => {
        remainingTime -= 1000;
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        process.stdout.write(`Next ranking update in: ${minutes}m ${seconds}s\r`);

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            runRankingScript(); // Run the script when countdown finishes
            startCountdown(duration); // Restart the countdown
            lastUpdateTime = Date.now(); // Update lastUpdateTime
        }
    }, 1000);
}

// API endpoint to get the remaining time and last update time
this._app.get('/remaining-time', (_, res) => {
    res.json({ remainingTime, lastUpdateTime });
});

// Run the script immediately when the server starts
runRankingScript();

// Start the initial countdown
startCountdown(1800000); // Starts with 30 seconds for testing; change to 1800000 (30 minutes) for production