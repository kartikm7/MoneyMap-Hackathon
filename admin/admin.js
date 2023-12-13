const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Your other configuration options (if any)
});

const auth = admin.auth();

module.exports = {
  auth: auth, // Include the auth method in the exported object
};
