# 프로젝트 플랜 (진행상황 요약 및 해야 할 일)

## 1. 배포 및 환경설정
- [완료] Netlify(프론트) & Render(백엔드) 배포, 환경변수 적용, 빌드/배포 명령어 점검
- [완료] monorepo 구조에서 루트/서브 디렉토리 지정, 의존성 관리
- [점검] 환경변수 변경 시, Netlify/Render 환경변수 동기화 및 빌드 트리거 확인

## 2. CORS 및 인증
- [완료] 백엔드 CORS 설정(Origin, credentials, headers, methods 등) → 정상 동작 확인
- [완료] 프론트엔드 credentials: true, API 주소 환경변수화
- [점검] 인증 API(로그인/회원가입/트리 생성 등)에서 Authorization 헤더 누락 여부, 응답 포맷(res.json) 일관성

## 3. 의존성 및 빌드
- [완료] 누락된 패키지(npm install), package.json/lock 커밋, 빌드 성공
- [완료] PWA 플러그인 옵션/경로 점검, 필요시 주석 처리
- [점검] 신규 패키지 추가 시, 반드시 커밋/푸시/배포까지 일관되게 진행

## 4. API 주소 및 환경변수
- [완료] API baseURL, wsUrl 등 환경변수 기반으로 통일, 하드코딩 제거
- [완료] Netlify/Render 환경변수 설정, 빌드 후 캐시 삭제 등 적용 절차 숙지

## 5. 로그인/회원가입 및 API 연동
- [완료] CORS 문제 해결, 인증 흐름 정상(401은 실제 인증 실패)
- [점검] 회원가입 후 자동 로그인/토큰 저장, Authorization 헤더 전달, API 응답 포맷(res.json) 일관성

## 6. 기타
- [완료] 아이콘 404 무시, /api/config 제거, 환경변수 기반 API 설정
- [점검] 백엔드 컨트롤러 응답(res.json), 로그/네트워크/콘솔 에러 실시간 점검

## 7. 중요 변경사항
- [완료] frontend/src/utils/axios.ts never 타입 오류(linter) 해결, 타입가드(isAxiosError) 및 as AxiosError<ErrorResponse> 단언으로 안전하게 처리
- [완료] 클로드팀 제안 반영: baseURL(getApiUrl), 토큰/인터셉터/콘솔로그/에러처리 개선, 불필요한 중복 export 제거
- [완료] 응답 인터셉터에서 401/네트워크/타임아웃 등 에러 처리 및 로그 강화

---

## 다음 해야 할 일
- 트리 생성 등 인증 필요한 API에서 Authorization 헤더 전달 및 응답 포맷(res.json) 일관성 재점검
- logs 폴더의 로그 파일을 통해 실제 에러/경고 내역 확인
- 테스트 진행 시 MCP 도구로 브라우저 띄우고, 각 메뉴 클릭/동작 확인
- 새로운 이슈 발생 시, 네트워크/콘솔/로그 확인 후 필요한 파일만 읽고, 최소 단위로 수정/커밋/배포 