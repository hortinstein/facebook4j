var production = {};

var test = {
    "facebook_app_id": "205833396111241",
    "facebook_app_secret": "af069abcb058400f9d9d3fc8ca53e3e0",
    "facebook_callback_url": "http://localhost:3000/auth/facebook/callback"
};

var development = {};

//http://stackoverflow.com/questions/8332333/node-js-setting-up-environment-specific-configs-to-be-used-with-everyauth
module.exports = function() {
    switch (process.env.NODE_ENV) {
        default: return test;
    }
};