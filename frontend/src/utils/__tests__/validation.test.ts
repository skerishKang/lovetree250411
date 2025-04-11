import { validateEmail, validatePassword } from '../validation';

describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.kr')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@example')).toBe(false);
    expect(validateEmail('test@.com')).toBe(false);
    expect(validateEmail('test@example..com')).toBe(false);
  });

  it('should handle empty or whitespace strings', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('   ')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should return true for valid passwords', () => {
    expect(validatePassword('Password123!')).toBe(true);
    expect(validatePassword('Abc123!@#')).toBe(true);
    expect(validatePassword('1qaz@WSX')).toBe(true);
  });

  it('should return false for passwords without uppercase letters', () => {
    expect(validatePassword('password123!')).toBe(false);
  });

  it('should return false for passwords without lowercase letters', () => {
    expect(validatePassword('PASSWORD123!')).toBe(false);
  });

  it('should return false for passwords without numbers', () => {
    expect(validatePassword('Password!@#')).toBe(false);
  });

  it('should return false for passwords without special characters', () => {
    expect(validatePassword('Password123')).toBe(false);
  });

  it('should return false for passwords shorter than 8 characters', () => {
    expect(validatePassword('Pwd1!')).toBe(false);
  });

  it('should handle empty or whitespace strings', () => {
    expect(validatePassword('')).toBe(false);
    expect(validatePassword('   ')).toBe(false);
  });
}); 