// 기본 테스트 - 환경 설정이 올바른지 확인
describe('간단한 테스트', () => {
  it('true는 true입니다', () => {
    expect(true).toBe(true);
  });
  
  it('1 + 1 = 2 입니다', () => {
    expect(1 + 1).toBe(2);
  });
});

// localStorage 테스트
test('localStorage mock works', () => {
  localStorage.setItem('test', 'value');
  expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value');
});

// DOM 테스트
test('dom testing works', () => {
  document.body.innerHTML = '<div id="test">Hello</div>';
  expect(document.getElementById('test')).toHaveTextContent('Hello');
}); 