const jwt = require('jsonwebtoken');

// JWT 토큰 생성 함수
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Google OAuth 인증 시작
// @route   GET /api/auth/google
exports.googleAuth = (req, res) => {
  // Google OAuth 인증 시작
  res.redirect('/api/auth/google/callback');
};

// @desc    Google OAuth 콜백 처리
// @route   GET /api/auth/google/callback
exports.googleCallback = (req, res) => {
  // 성공적으로 인증된 경우
  if (req.user) {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } else {
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=인증에 실패했습니다.`);
  }
};

// @desc    Google OAuth 인증 실패 처리
// @route   GET /api/auth/google/failure
exports.googleFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=인증에 실패했습니다.`);
}; 