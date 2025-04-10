const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// @desc    프로필 조회
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('프로필 조회 시작', {
      timestamp: new Date().toISOString(),
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      logger.warn('프로필 조회 실패 - 사용자 없음', {
        timestamp: new Date().toISOString(),
        userId: req.user._id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    logger.info('프로필 조회 성공', {
      timestamp: new Date().toISOString(),
      userId: user._id,
      username: user.name,
      email: user.email,
      profileImage: user.profileImage,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(user);
  } catch (error) {
    logger.error('프로필 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user._id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '프로필 조회에 실패했습니다.', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// @desc    프로필 수정
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('프로필 수정 시작', {
      timestamp: new Date().toISOString(),
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      updateData: {
        name: req.body.name,
        email: req.body.email,
        hasImage: !!req.file
      }
    });

    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      logger.warn('프로필 수정 실패 - 사용자 없음', {
        timestamp: new Date().toISOString(),
        userId: req.user._id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 이메일 중복 체크
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        logger.warn('프로필 수정 실패 - 이메일 중복', {
          timestamp: new Date().toISOString(),
          userId: req.user._id,
          username: req.user.name,
          email,
          queryTime: `${Date.now() - startTime}ms`
        });
        return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
      }
    }

    // 프로필 이미지 업로드 처리
    if (req.file) {
      // 기존 이미지 삭제
      if (user.profileImage && user.profileImage !== 'default-profile.png') {
        const oldImagePath = path.join(__dirname, '../uploads', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          logger.info('기존 프로필 이미지 삭제', {
            timestamp: new Date().toISOString(),
            userId: req.user._id,
            username: req.user.name,
            oldImage: user.profileImage
          });
        }
      }
      user.profileImage = req.file.filename;
    }

    // 정보 업데이트
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    
    logger.info('프로필 수정 성공', {
      timestamp: new Date().toISOString(),
      userId: user._id,
      username: user.name,
      email: user.email,
      profileImage: user.profileImage,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(user);
  } catch (error) {
    logger.error('프로필 수정 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user._id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '프로필 수정에 실패했습니다.', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// @desc    비밀번호 변경
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('비밀번호 변경 시작', {
      timestamp: new Date().toISOString(),
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      logger.warn('비밀번호 변경 실패 - 사용자 없음', {
        timestamp: new Date().toISOString(),
        userId: req.user._id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      logger.warn('비밀번호 변경 실패 - 현재 비밀번호 불일치', {
        timestamp: new Date().toISOString(),
        userId: req.user._id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    // 새 비밀번호 설정
    user.password = newPassword;
    await user.save();

    logger.info('비밀번호 변경 성공', {
      timestamp: new Date().toISOString(),
      userId: user._id,
      username: user.name,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    logger.error('비밀번호 변경 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user._id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '비밀번호 변경에 실패했습니다.', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}; 