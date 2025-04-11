# LoveTree API 문서

## 인증 API

### 회원가입
- **POST** `/api/auth/register`
- **요청 본문**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **응답**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
  ```

### 로그인
- **POST** `/api/auth/login`
- **요청 본문**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **응답**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
  ```

## 게시물 API

### 게시물 생성
- **POST** `/api/posts`
- **헤더**: `Authorization: Bearer <token>`
- **요청 본문**:
  ```json
  {
    "title": "string",
    "content": "string",
    "images": ["string"],
    "isPublic": boolean,
    "category": "string",
    "tags": ["string"]
  }
  ```

### 게시물 목록 조회
- **GET** `/api/posts`
- **쿼리 파라미터**:
  - `page`: 페이지 번호
  - `limit`: 페이지당 게시물 수
  - `category`: 카테고리 필터
  - `tag`: 태그 필터

### 게시물 상세 조회
- **GET** `/api/posts/:id`

### 게시물 수정
- **PUT** `/api/posts/:id`
- **헤더**: `Authorization: Bearer <token>`

### 게시물 삭제
- **DELETE** `/api/posts/:id`
- **헤더**: `Authorization: Bearer <token>`

## 댓글 API

### 댓글 추가
- **POST** `/api/posts/:postId/comments`
- **헤더**: `Authorization: Bearer <token>`
- **요청 본문**:
  ```json
  {
    "content": "string"
  }
  ```

### 댓글 삭제
- **DELETE** `/api/posts/:postId/comments/:commentId`
- **헤더**: `Authorization: Bearer <token>`

## 좋아요 API

### 좋아요 토글
- **POST** `/api/posts/:id/like`
- **헤더**: `Authorization: Bearer <token>`

## 팔로우 API

### 팔로우
- **POST** `/api/users/:userId/follow`
- **헤더**: `Authorization: Bearer <token>`

### 언팔로우
- **DELETE** `/api/users/:userId/follow`
- **헤더**: `Authorization: Bearer <token>`

### 팔로워 목록 조회
- **GET** `/api/users/:userId/followers`

### 팔로잉 목록 조회
- **GET** `/api/users/:userId/following`

## 프로필 API

### 프로필 조회
- **GET** `/api/profiles/:userId`

### 프로필 수정
- **PUT** `/api/profiles`
- **헤더**: `Authorization: Bearer <token>`

### 비밀번호 변경
- **PUT** `/api/profiles/password`
- **헤더**: `Authorization: Bearer <token>`
- **요청 본문**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

## 알림 API

### 알림 목록 조회
- **GET** `/api/notifications`
- **헤더**: `Authorization: Bearer <token>`

### 알림 읽음 표시
- **PUT** `/api/notifications/:id/read`
- **헤더**: `Authorization: Bearer <token>`

### 모든 알림 읽음 표시
- **PUT** `/api/notifications/read-all`
- **헤더**: `Authorization: Bearer <token>`

### 알림 삭제
- **DELETE** `/api/notifications/:id`
- **헤더**: `Authorization: Bearer <token>`

## 채팅 API

### 채팅방 목록 조회
- **GET** `/api/chats`
- **헤더**: `Authorization: Bearer <token>`

### 채팅방 생성
- **POST** `/api/chats`
- **헤더**: `Authorization: Bearer <token>`
- **요청 본문**:
  ```json
  {
    "participants": ["userId"]
  }
  ```

### 채팅 메시지 전송
- **POST** `/api/chats/:chatId/messages`
- **헤더**: `Authorization: Bearer <token>`
- **요청 본문**:
  ```json
  {
    "content": "string"
  }
  ```

### 채팅 메시지 목록 조회
- **GET** `/api/chats/:chatId/messages`
- **헤더**: `Authorization: Bearer <token>` 