describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    cy.get('a').contains('로그인').click();
    cy.url().should('include', '/login');
  });

  it('should handle successful login', () => {
    cy.visit('/login');
    
    cy.get('input[placeholder="이메일"]').type('test@example.com');
    cy.get('input[placeholder="비밀번호"]').type('Password123!');
    cy.get('button').contains('로그인').click();

    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('span').contains('테스트 사용자').should('be.visible');
  });

  it('should handle failed login', () => {
    cy.visit('/login');
    
    cy.get('input[placeholder="이메일"]').type('test@example.com');
    cy.get('input[placeholder="비밀번호"]').type('wrongpassword');
    cy.get('button').contains('로그인').click();

    cy.get('p').contains('로그인에 실패했습니다.').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.get('a').contains('회원가입').click();
    cy.url().should('include', '/register');
  });

  it('should handle successful registration', () => {
    cy.visit('/register');
    
    cy.get('input[placeholder="이름"]').type('새로운 사용자');
    cy.get('input[placeholder="이메일"]').type('new@example.com');
    cy.get('input[placeholder="비밀번호"]').type('Password123!');
    cy.get('input[placeholder="비밀번호 확인"]').type('Password123!');
    cy.get('button').contains('회원가입').click();

    cy.url().should('include', '/login');
    cy.get('p').contains('회원가입이 완료되었습니다.').should('be.visible');
  });

  it('should handle registration with existing email', () => {
    cy.visit('/register');
    
    cy.get('input[placeholder="이름"]').type('기존 사용자');
    cy.get('input[placeholder="이메일"]').type('existing@example.com');
    cy.get('input[placeholder="비밀번호"]').type('Password123!');
    cy.get('input[placeholder="비밀번호 확인"]').type('Password123!');
    cy.get('button').contains('회원가입').click();

    cy.get('p').contains('이미 존재하는 이메일입니다.').should('be.visible');
  });

  it('should handle logout', () => {
    // 먼저 로그인
    cy.visit('/login');
    cy.get('input[placeholder="이메일"]').type('test@example.com');
    cy.get('input[placeholder="비밀번호"]').type('Password123!');
    cy.get('button').contains('로그인').click();

    // 로그아웃
    cy.get('button').contains('로그아웃').click();
    cy.url().should('include', '/login');
    cy.get('a').contains('로그인').should('be.visible');
  });
}); 