describe('Security Tests', () => {
  it('should prevent XSS attacks', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    // XSS 공격 시도
    const response = await fetch('http://localhost:3000/api/tree/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: maliciousInput,
        content: maliciousInput
      })
    });
    
    const data = await response.json();
    expect(data.title).not.toContain('<script>');
    expect(data.content).not.toContain('<script>');
  });

  it('should prevent SQL injection', async () => {
    const sqlInjection = "' OR '1'='1";
    
    // SQL 인젝션 공격 시도
    const response = await fetch(`http://localhost:3000/api/tree/nodes/search?q=${sqlInjection}`);
    const data = await response.json();
    
    expect(data.error).toBeDefined();
    expect(data.nodes).toBeUndefined();
  });

  it('should validate input data', async () => {
    // 잘못된 입력 데이터
    const invalidData = {
      title: 'a'.repeat(101), // 100자 제한 초과
      content: '',
      tags: ['invalid-tag'.repeat(21)] // 20자 제한 초과
    };
    
    const response = await fetch('http://localhost:3000/api/tree/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });
    
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.errors).toHaveProperty('title');
    expect(data.errors).toHaveProperty('content');
    expect(data.errors).toHaveProperty('tags');
  });

  it('should handle authentication properly', async () => {
    // 인증되지 않은 요청
    const response = await fetch('http://localhost:3000/api/tree/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    expect(response.status).toBe(401);
  });

  it('should prevent CSRF attacks', async () => {
    // CSRF 토큰 없이 요청
    const response = await fetch('http://localhost:3000/api/tree/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    expect(response.status).toBe(403);
  });

  it('should handle rate limiting', async () => {
    // 연속된 요청 시도
    const requests = Array(101).fill(null).map(() => 
      fetch('http://localhost:3000/api/tree/nodes')
    );
    
    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];
    
    expect(lastResponse.status).toBe(429); // Too Many Requests
  });

  it('should protect sensitive data', async () => {
    // 사용자 정보 요청
    const response = await fetch('http://localhost:3000/api/users/1');
    const data = await response.json();
    
    expect(data.password).toBeUndefined();
    expect(data.email).toBeDefined();
  });

  it('should handle file upload security', async () => {
    // 악성 파일 업로드 시도
    const formData = new FormData();
    const maliciousFile = new Blob(['malicious content'], { type: 'application/octet-stream' });
    formData.append('file', maliciousFile, 'malicious.exe');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(400);
  });
}); 