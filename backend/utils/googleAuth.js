const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client("562166999915-35gr94lrk1ui7nmljshk9paoigppe690.apps.googleusercontent.com");

module.exports = {
  googleClient
};