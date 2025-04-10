# LoveTree Backend

LoveTree는 커플을 위한 소셜 네트워크 서비스의 백엔드 서버입니다.

## 기능

- 사용자 인증 및 권한 관리
- 게시물 CRUD 기능
- 댓글 기능
- 좋아요 기능
- 팔로우/팔로잉 기능
- 실시간 알림
- 채팅 기능
- 프로필 관리

## 기술 스택

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT
- Passport.js
- Redis
- Winston (로깅)

## 설치 방법

1. 저장소 클론
```bash
git clone [repository-url]
cd lovetree/backend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## API 문서

API 문서는 [여기](docs/api.md)에서 확인할 수 있습니다.

## 테스트

```bash
npm test
```

## 로깅

- 로그 파일은 `logs` 디렉토리에 저장됩니다.
- 개발 모드에서는 콘솔에도 로그가 출력됩니다.

## 라이센스

MIT 