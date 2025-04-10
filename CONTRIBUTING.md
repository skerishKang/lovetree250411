# 기여 가이드라인

러브트리 프로젝트에 기여하고 싶으신 분들을 환영합니다! 이 문서는 프로젝트 기여 방법에 대한 가이드라인을 제공합니다.

## 기여 방법

1. 이슈 제기
   - 버그를 발견하셨다면 GitHub Issues에 보고해주세요.
   - 새로운 기능을 제안하고 싶으시다면 GitHub Issues에 제안해주세요.

2. Pull Request
   - Fork 후 개발용 브랜치를 생성하세요.
   - 코드를 수정하고 테스트를 진행하세요.
   - Pull Request를 생성하세요.

## 개발 환경 설정

1. 저장소를 복제합니다:
   ```bash
   git clone https://github.com/yourusername/lovetree.git
   ```

2. 의존성을 설치합니다:
   ```bash
   cd lovetree
   npm install
   ```

3. 개발 서버를 시작합니다:
   ```bash
   npm run dev
   ```

## 코드 스타일

- ESLint와 Prettier 설정을 따라주세요.
- 컴포넌트는 함수형으로 작성해주세요.
- 주석은 한글로 작성해주세요.

## 테스트

- 새로운 기능을 추가할 때는 테스트 코드도 함께 작성해주세요.
- 테스트 실행:
  ```bash
  npm test
  ```

## 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따라주세요:

```
type: 제목

본문

footer
```

Type:
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드
- chore: 기타 변경사항

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 기여하시는 모든 코드는 이 라이선스를 따르게 됩니다. 