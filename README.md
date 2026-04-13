# 가계부 프로젝트

Vue 기반으로 제작한 가계부 웹 애플리케이션입니다.  
사용자가 수입과 지출을 효율적으로 관리하고 흐름을 파악할 수 있도록 설계했습니다.

---

## 1. 프로젝트 개요

- 프로젝트명: DonTouch(돈 터치)
- 개발 기간: (2026-04-07 ~ 2026-04-13)
- 개발 인원: 5명 (돈 터치 미)

### 프로젝트 목적

단순 CRUD 구현을 넘어, 상태 관리와 라우팅, API 통신을 통합적으로 경험하기 위해 제작했습니다.

- Pinia를 활용한 전역 상태 관리
- Vue Router 기반 페이지 구조 설계
- json-server를 활용한 REST API 구현

---

## 2. 기술 스택

### Frontend

- Vue 3 (Composition API)
- Vue Router
- Pinia

### Backend (Mock Server)

- json-server

---

## 3. 디렉토리 구조

KB-SKELETON-PROJECT/
├── public/                 
├── src/                    
│   ├── assets/             # 이미지, 폰트, CSS 등 정적 자원
│   ├── components/         # 공통 UI 컴포넌트 (Footer, SideBar 등)
│   ├── pages/              # 서비스의 각 화면 (Page 단위 컴포넌트)
│   │   ├── budget/         # 예산 관리 관련 페이지
│   │   ├── calendar/       # 달력 및 거래 내역 페이지
│   │   ├── main/           # 메인 대시보드 및 차트 페이지
│   │   └── user/           # 로그인, 회원가입, 마이페이지
│   ├── router/             # Vue Router 경로 설정 (index.js)
│   ├── stores/             # Pinia 전역 상태 관리 (기능별 분리)
│   ├── App.vue             # 최상위 루트 컴포넌트
│   └── main.js             # 프로젝트 엔트리 포인트 (App 마운트)
├── db.json                 # Mock API 서버용 데이터 (json-server용)
├── vite.config.js          # Vite 빌드 설정 파일
└── package.json            # 의존성 라이브러리 관리 및 스크립트
