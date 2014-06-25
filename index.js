var neo4j = require('neo4j');
var fbgraph = require('fbgraph');

//for serving the login strategy
var express = require('express');

//

//passport middleware
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');

//setting up local variables
var confModule = require('./config.js');
var config = new confModule;
var FACEBOOK_APP_ID = config.facebook_app_id;
var FACEBOOK_APP_SECRET = config.facebook_app_secret;
var FACEBOOK_APP_CALLBACK_URL = config.facebook_callback_url;\

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
        callbackURL: facebook_callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }

));

var app = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret: 'keyboard cat'
    }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
})

app.get('/', function(req, res) {
    res.render('index', {
        user: req.user
    });
});

app.get('/account', ensureAuthenticated, function(req, res) {
    res.render('account', {
        user: req.user
    });
});

app.get('/login', ensureAuthenticated, function(req, res) {
    res.render('login', {
        user: req.user
    });
});


app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res) {
    // body...
});
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/login'
}), function(req, res) {
    res.redirect('/');
});

app.listen(3000);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return :next();
    }
    res.redirect('/login')
}