const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '이름을 입력해주세요.'],
      trim: true,
      maxlength: [50, '이름은 50자를 초과할 수 없습니다.'],
    },
    email: {
      type: String,
      required: [true, '이메일을 입력해주세요.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        '유효한 이메일 주소를 입력해주세요.',
      ],
    },
    password: {
      type: String,
      required: [true, '비밀번호를 입력해주세요.'],
      minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
      default: 'default.jpg',
    },
    bio: {
      type: String,
      maxlength: [200, '자기소개는 200자를 초과할 수 없습니다.'],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// 사용자 생성/수정/삭제 시 로깅
userSchema.post('save', function(doc) {
  logger.info('사용자 저장/수정', {
    timestamp: new Date().toISOString(),
    userId: doc._id,
    username: doc.name,
    email: doc.email,
    role: doc.role,
    isNew: doc.isNew
  });
});

userSchema.post('remove', function(doc) {
  logger.info('사용자 삭제', {
    timestamp: new Date().toISOString(),
    userId: doc._id,
    username: doc.name,
    email: doc.email
  });
});

// 비밀번호 해싱
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const startTime = Date.now();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    logger.info('비밀번호 해싱 완료', {
      timestamp: new Date().toISOString(),
      userId: this._id,
      username: this.name,
      processTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    logger.error('비밀번호 해싱 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: this._id,
      username: this.name
    });
    throw error;
  }
});

// 비밀번호 일치 확인 메서드
userSchema.methods.matchPassword = async function (enteredPassword) {
  const startTime = Date.now();
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    logger.info('비밀번호 일치 확인', {
      timestamp: new Date().toISOString(),
      userId: this._id,
      username: this.name,
      isMatch,
      processTime: `${Date.now() - startTime}ms`
    });
    return isMatch;
  } catch (error) {
    logger.error('비밀번호 일치 확인 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: this._id,
      username: this.name
    });
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 