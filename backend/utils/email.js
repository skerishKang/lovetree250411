const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    logger.info('이메일 서비스 초기화', {
      timestamp: new Date().toISOString(),
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER
    });
  }

  async sendEmail(to, subject, html) {
    const startTime = Date.now();
    try {
      logger.info('이메일 전송 시도', {
        timestamp: new Date().toISOString(),
        to,
        subject,
        contentLength: html.length
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('이메일 전송 성공', {
        timestamp: new Date().toISOString(),
        messageId: info.messageId,
        to,
        subject,
        processingTime: `${Date.now() - startTime}ms`
      });

      return info;
    } catch (error) {
      logger.error('이메일 전송 실패', {
        timestamp: new Date().toISOString(),
        to,
        subject,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <h1>이메일 인증</h1>
      <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
      <a href="${verificationUrl}">인증하기</a>
      <p>링크는 24시간 동안 유효합니다.</p>
    `;

    return this.sendEmail(to, '이메일 인증', html);
  }

  async sendPasswordResetEmail(to, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <h1>비밀번호 재설정</h1>
      <p>아래 링크를 클릭하여 비밀번호를 재설정해주세요:</p>
      <a href="${resetUrl}">비밀번호 재설정</a>
      <p>링크는 1시간 동안 유효합니다.</p>
    `;

    return this.sendEmail(to, '비밀번호 재설정', html);
  }

  async sendWelcomeEmail(to, username) {
    const html = `
      <h1>환영합니다, ${username}님!</h1>
      <p>LoveTree에 가입해주셔서 감사합니다.</p>
      <p>즐거운 시간 보내세요!</p>
    `;

    return this.sendEmail(to, 'LoveTree에 오신 것을 환영합니다', html);
  }

  async sendNotificationEmail(to, title, content) {
    const html = `
      <h1>${title}</h1>
      <p>${content}</p>
    `;

    return this.sendEmail(to, title, html);
  }
}

module.exports = new EmailService(); 