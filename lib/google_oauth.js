//Taken from a Google OAuth2 guide

const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = [
  'email',
  'profile',
  'openid',
];

function getOAuth2Client(creds) {
  const { client_id, client_secret, redirect_uri } = creds;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  return oAuth2Client
}

function getAuthUrl(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return authUrl;
}

module.exports = {
  getAuthUrl: getAuthUrl,
  getOAuth2Client: getOAuth2Client
};
