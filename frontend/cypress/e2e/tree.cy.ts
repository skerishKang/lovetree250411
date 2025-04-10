describe('Tree Node E2E Tests', () => {
  beforeEach(() => {
    // 로그인
    cy.visit('/login');
    cy.get('input[placeholder="이메일"]').type('test@example.com');
    cy.get('input[placeholder="비밀번호"]').type('Password123!');
    cy.get('button').contains('로그인').click();
  });

  it('should display tree nodes', () => {
    cy.visit('/');
    cy.get('h2').contains('첫 번째 노드').should('be.visible');
    cy.get('h2').contains('두 번째 노드').should('be.visible');
  });

  it('should handle search functionality', () => {
    cy.visit('/');
    
    cy.get('input[placeholder="검색어를 입력하세요"]').type('첫 번째');
    cy.get('button').contains('검색').click();

    cy.get('h2').contains('첫 번째 노드').should('be.visible');
    cy.get('h2').contains('두 번째 노드').should('not.exist');
  });

  it('should handle tag filtering', () => {
    cy.visit('/');
    
    cy.get('button').contains('태그1').click();

    cy.get('h2').contains('첫 번째 노드').should('be.visible');
    cy.get('h2').contains('두 번째 노드').should('not.exist');
  });

  it('should handle node like interaction', () => {
    cy.visit('/');
    
    cy.get('button').contains('좋아요').first().click();
    cy.get('span').contains('6').should('be.visible');
  });

  it('should handle node comment interaction', () => {
    cy.visit('/');
    
    // 노드 상세 페이지로 이동
    cy.get('a').contains('첫 번째 노드').click();
    
    // 댓글 입력
    cy.get('textarea[placeholder="댓글을 입력하세요"]').type('테스트 댓글입니다.');
    cy.get('button').contains('댓글 작성').click();

    cy.get('p').contains('테스트 댓글입니다.').should('be.visible');
  });

  it('should handle node creation', () => {
    cy.visit('/');
    
    cy.get('button').contains('새 노드 작성').click();
    
    cy.get('input[placeholder="제목"]').type('새로운 노드');
    cy.get('textarea[placeholder="내용"]').type('새로운 노드의 내용입니다.');
    cy.get('input[placeholder="태그"]').type('새로운태그{enter}');
    cy.get('button').contains('작성하기').click();

    cy.url().should('include', '/');
    cy.get('h2').contains('새로운 노드').should('be.visible');
  });

  it('should handle node editing', () => {
    cy.visit('/');
    
    // 노드 상세 페이지로 이동
    cy.get('a').contains('첫 번째 노드').click();
    
    cy.get('button').contains('수정').click();
    cy.get('input[placeholder="제목"]').clear().type('수정된 노드');
    cy.get('textarea[placeholder="내용"]').clear().type('수정된 내용입니다.');
    cy.get('button').contains('저장').click();

    cy.get('h2').contains('수정된 노드').should('be.visible');
    cy.get('p').contains('수정된 내용입니다.').should('be.visible');
  });

  it('should handle node deletion', () => {
    cy.visit('/');
    
    // 노드 상세 페이지로 이동
    cy.get('a').contains('첫 번째 노드').click();
    
    cy.get('button').contains('삭제').click();
    cy.get('button').contains('확인').click();

    cy.url().should('include', '/');
    cy.get('h2').contains('첫 번째 노드').should('not.exist');
  });
}); 