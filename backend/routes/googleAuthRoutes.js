const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  googleAuth,
  googleCallback,
  googleFailure
} = require('../controllers/googleAuthController');

// Google OAuth 라우트
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false
  }),
  googleCallback
);

router.get('/google/failure', googleFailure);

module.exports = router; 