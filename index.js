//https://github.com/jaredhanson/passport-facebook/tree/master/examples/login 
//rewrote using jade

var neo4j = require('neo4j');
var fbgraph = require('fbgraph');

//for serving the login strategy
var express = require('express');

//

//passport middleware
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var cookieParser = require('cookie-parser');
//setting up local variables
var confModule = require('./config.js');
var config = new confModule;
var FACEBOOK_APP_ID = config.facebook_app_id;
var FACEBOOK_APP_SECRET = config.facebook_app_secret;
var FACEBOOK_APP_CALLBACK_URL = config.facebook_callback_url;

//functions where users data is stored
passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log(obj);
    done(null, obj);
});

//setting up the passport strategy
passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: FACEBOOK_APP_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }

));

var app = express();

//app .configure was depreciated
//http: //stackoverflow.com/questions/22202232/express-has-no-method-configure-error

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.logger());
app.use(cookieParser());
//app.use(express.bodyParser());
//app.use(express.methodOverride());
// app.use(express.session({
//     secret: 'keyboard cat'
// }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

var router = express.Router();
app.use(express.static(__dirname + '/public'));


router.get('/', function(req, res) {
    res.render('index', {
        user: req.user,
        tester: {
            test: 'kekeke protester'
        }
    });
});

router.get('/account', ensureAuthenticated, function(req, res) {
    res.render('account', {
        user: req.user
    });
});

router.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    });
});


router.get('/auth/facebook', passport.authenticate('facebook'), function(req, res) {
    // body...
});

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/login'
}), function(req, res) {
    res.redirect('/');
});
app.use('/', router);
app.listen(3000);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else
        res.redirect('/login')
}