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

````
DonTouch/
├── public/                 # 정적 리소스 (favicon, index.html 등)
├── src/
│   ├── assets/             # 이미지, 스타일시트(CSS/SCSS) 등 정적 자산
│   ├── components/         # 공통 UI 컴포넌트
│   │   ├── Footer.vue      # 하단 정보 레이아웃
│   │   └── SideBar.vue     # 사이드 내비게이션 바
│   ├── pages/              # 페이지 단위 컴포넌트 (View)
│   │   ├── budget/         # 예산 관리 도메인
│   │   │   ├── Budget.vue
│   │   │   └── BudgetChart.vue
│   │   ├── calendar/       # 가계부/거래 내역 도메인
│   │   │   ├── transactionslistmenu/ # 내역 필터링 메뉴
│   │   │   ├── Calendar.vue
│   │   │   ├── TransactionList.vue
│   │   │   └── TransactionEdit.vue
│   │   ├── main/           # 메인 대시보드 도메인
│   │   │   ├── Main.vue
│   │   │   ├── MainChartIn.vue
│   │   │   └── MainChartOut.vue
│   │   └── user/           # 사용자 인증/마이페이지 도메인
│   │       ├── Join.vue
│   │       ├── Login.vue
│   │       └── MyPage.vue
│   ├── router/             # Vue Router (페이지 경로 설정)
│   ├── stores/             # Pinia 상태 관리 저장소 (Data)
│   │   ├── auth.js         # 사용자 인증 상태
│   │   ├── budget.js       # 예산 데이터 관리
│   │   ├── transaction.js  # 거래 내역 데이터 관리
│   │   └── ...             # 기능별 개별 스토어
│   ├── App.vue             # 최상위 루트 컴포넌트
│   └── main.js             # 애플리케이션 엔트리 포인트
├── db.json                 # 로컬 테스트용 Mock 데이터 (json-server)
├── vite.config.js          # Vite 빌드 및 개발 환경 설정
└── package.json            # 프로젝트 의존성 및 스크립트 관리
````
