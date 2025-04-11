import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('should load homepage within 2 seconds', async () => {
    const startTime = performance.now();
    
    // 홈페이지 로딩 테스트
    const response = await fetch('http://localhost:3000');
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000); // 2초 이내
  });

  it('should render tree nodes within 1 second', async () => {
    const startTime = performance.now();
    
    // 트리 노드 렌더링 테스트
    const response = await fetch('http://localhost:3000/api/tree/nodes');
    const data = await response.json();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
  });

  it('should handle large number of nodes efficiently', async () => {
    const startTime = performance.now();
    
    // 대량의 노드 로딩 테스트
    const response = await fetch('http://localhost:3000/api/tree/nodes?limit=100');
    const data = await response.json();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(3000); // 3초 이내
    expect(data.nodes.length).toBe(100);
  });

  it('should handle search efficiently', async () => {
    const startTime = performance.now();
    
    // 검색 성능 테스트
    const response = await fetch('http://localhost:3000/api/tree/nodes/search?q=test');
    const data = await response.json();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
  });

  it('should handle concurrent requests efficiently', async () => {
    const startTime = performance.now();
    
    // 동시 요청 처리 테스트
    const requests = Array(10).fill(null).map(() => 
      fetch('http://localhost:3000/api/tree/nodes')
    );
    
    await Promise.all(requests);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // 5초 이내
  });

  it('should handle image upload efficiently', async () => {
    const startTime = performance.now();
    
    // 이미지 업로드 성능 테스트
    const formData = new FormData();
    const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
    formData.append('image', imageBlob);
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(3000); // 3초 이내
  });

  it('should handle real-time updates efficiently', async () => {
    const startTime = performance.now();
    
    // 실시간 업데이트 성능 테스트
    const ws = new WebSocket('ws://localhost:3000/ws');
    await new Promise(resolve => ws.onopen = resolve);
    
    ws.send(JSON.stringify({ type: 'subscribe', channel: 'updates' }));
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    ws.close();
  });
}); 