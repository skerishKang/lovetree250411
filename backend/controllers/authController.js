const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// JWT 토큰 생성 함수
const generateToken = (id) => {
  const startTime = Date.now();
  logger.info('JWT 토큰 생성 시도', {
    timestamp: new Date().toISOString(),
    userId: id
  });

  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  logger.info('JWT 토큰 생성 완료', {
    timestamp: new Date().toISOString(),
    userId: id,
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 10) + '...',
    generateTime: `${Date.now() - startTime}ms`
  });

  return token;
};

// @desc    회원가입
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('회원가입 요청 수신', {
      timestamp: new Date().toISOString(),
      email: req.body.email,
      username: req.body.username,
      ip: req.ip
    });

    const { username, email, password } = req.body;

    // 이메일 중복 체크
    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn('회원가입 실패 - 이메일 중복', {
        timestamp: new Date().toISOString(),
        email,
        processTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }

    // 새 사용자 생성
    const user = await User.create({
      name: username,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      logger.info('회원가입 성공', {
        timestamp: new Date().toISOString(),
        userId: user._id,
        email: user.email,
        username: user.name,
        processTime: `${Date.now() - startTime}ms`
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    }
  } catch (error) {
    logger.error('회원가입 실패', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
};

// @desc    로그인
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('로그인 요청 수신', {
      timestamp: new Date().toISOString(),
      email: req.body.email,
      ip: req.ip
    });

    const { email, password } = req.body;

    // 이메일로 사용자 찾기 (비밀번호 필드 포함)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('로그인 실패 - 사용자를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        email,
        processTime: `${Date.now() - startTime}ms`
      });
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn('로그인 실패 - 비밀번호 불일치', {
        timestamp: new Date().toISOString(),
        email,
        processTime: `${Date.now() - startTime}ms`
      });
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLogin = Date.now();
    await user.save();
    logger.info('마지막 로그인 시간 업데이트', {
      timestamp: new Date().toISOString(),
      userId: user._id,
      lastLogin: new Date(user.lastLogin).toISOString()
    });

    // JWT 토큰 생성
    const token = generateToken(user._id);
    logger.info('로그인 성공', {
      timestamp: new Date().toISOString(),
      userId: user._id,
      email: user.email,
      username: user.name,
      processTime: `${Date.now() - startTime}ms`
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.name,
        email: user.email,
      },
      message: '로그인 성공'
    });
  } catch (error) {
    logger.error('로그인 실패', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      processTime: `${Date.now() - startTime}ms`
    });
    return res.status(500).json({
      success: false,
      message: '로그인 처리 중 서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    현재 사용자 정보 조회
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('현재 사용자 정보 조회 요청 수신', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      ip: req.ip
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn('현재 사용자 정보 조회 실패 - 사용자를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        userId: req.user.id,
        processTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    logger.info('현재 사용자 정보 조회 성공', {
      timestamp: new Date().toISOString(),
      userId: user._id,
      username: user.name,
      email: user.email,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (error) {
    logger.error('현재 사용자 정보 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
}; 