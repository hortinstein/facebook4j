//https://github.com/jaredhanson/passport-facebook/tree/master/examples/login 
//rewrote using jade
//http://flippinawesome.org/2014/06/23/using-node-js-in-production/?utm_source=nodeweekly&utm_medium=email
var neo4j = require('neo4j');
var graph = require('fbgraph');

//for serving the login strategy
var express = require('express');

//

//passport middleware
var async = require('async');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressValidator = require('express-validator');
var _ = require('lodash');
//setting up local variables
var confModule = require('./config.js');
var config = new confModule;
var FACEBOOK_APP_ID = config.facebook_app_id;
var FACEBOOK_APP_SECRET = config.facebook_app_secret;
var FACEBOOK_APP_CALLBACK_URL = config.facebook_callback_url;

//functions where users data is stored
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

//setting up the passport strategy
passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: FACEBOOK_APP_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        return done(null, profile);

    }

));

var app = express();

//app .configure was depreciated
//http: //stackoverflow.com/questions/22202232/express-has-no-method-configure-error

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    secret: "secrets.sessionSecret"
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    // Make user object available in templates.
    res.locals.user = req.user;
    next();
});

var router = express.Router();
app.use(express.static(__dirname + '/public'));


router.get('/', function(req, res) {
    res.render('index', {
        user: req.user
    });
});

router.get('/account', ensureAuthenticated, function(req, res) {
    console.log(req.user)
    graph.setAccessToken(req.user.accessToken);
    async.parallel({
            getMe: function(done) {
                graph.get(req.user.facebook, function(err, me) {
                    done(err, me);
                });
            },
            getMyFriends: function(done) {
                graph.get(req.user.facebook + '/friends', function(err, friends) {
                    done(err, friends.data);
                });
            }
        },
        function(err, results) {
            //if (err) return next(err);
            console.log('me', results);
            console.log('friends', results.getMyFriends);
            res.render('account', {
                user: req.user,
                me: results.getMe,
                friends: results.getMyFriends
            });
        });
});

router.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    });
});


router.get('/logout', function(req, res) {
    req.logout();
    res.render('index', {
        user: req.user
    });
});

router.get('/auth/facebook', passport.authenticate('facebook'), function(req, res) {

});

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/login',
    scope: ['friends']
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