
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', 'config', 'serviceAccountKey.json');

if (!admin.apps.length) {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn('Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or add backend/config/serviceAccountKey.json');
  }
}

// Set admin claim for a user
router.post('/setAdmin/:uid', async (req, res) => {
  if (!admin.apps.length) {
    return res.status(500).send('Firebase Admin SDK is not configured on the server');
  }

  const uid = req.params.uid;

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    res.status(200).send(`Admin role assigned to user: ${uid}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    res.status(500).send('Failed to assign admin role');
  }
});

module.exports = router;
