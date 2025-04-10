const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

// 사용자 직렬화
passport.serializeUser((user, done) => {
  logger.info('사용자 직렬화', {
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.name
  });
  done(null, user.id);
});

// 사용자 역직렬화
passport.deserializeUser(async (id, done) => {
  const startTime = Date.now();
  logger.info('사용자 역직렬화 시도', {
    timestamp: new Date().toISOString(),
    userId: id
  });

  try {
    const user = await User.findById(id);
    logger.info('사용자 역직렬화 성공', {
      timestamp: new Date().toISOString(),
      userId: id,
      username: user.name,
      deserializeTime: `${Date.now() - startTime}ms`
    });
    done(null, user);
  } catch (error) {
    logger.error('사용자 역직렬화 실패', {
      timestamp: new Date().toISOString(),
      userId: id,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    });
    done(error, null);
  }
});

// Google OAuth 전략
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const startTime = Date.now();
      logger.info('Google OAuth 인증 시도', {
        timestamp: new Date().toISOString(),
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      });

      try {
        // 이미 가입된 사용자인지 확인
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // 이미 가입된 사용자
          logger.info('기존 사용자 로그인 성공', {
            timestamp: new Date().toISOString(),
            userId: user._id,
            username: user.name,
            authTime: `${Date.now() - startTime}ms`
          });
          return done(null, user);
        }

        // 새 사용자 생성
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value,
          password: Math.random().toString(36).slice(-8), // 임시 비밀번호 생성
        });

        logger.info('새 사용자 생성 완료', {
          timestamp: new Date().toISOString(),
          userId: user._id,
          username: user.name,
          createTime: `${Date.now() - startTime}ms`
        });

        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth 인증 실패', {
          timestamp: new Date().toISOString(),
          googleId: profile.id,
          error: {
            message: error.message,
            name: error.name,
            stack: error.stack
          }
        });
        return done(error, null);
      }
    }
  )
); 