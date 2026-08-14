# 반응속도 측정 웹앱

화면이 파란색 → 빨간색으로 바뀌는 순간부터 클릭까지 걸린 시간(ms)을 측정하고,
Firebase(Firestore)에 기록을 저장/조회하는 웹앱입니다.

## 동작

1. 화면을 클릭하면 게임 시작 (기본 화면: 파란색)
2. 1~12초 사이 무작위 시간이 지나면 화면이 빨간색으로 바뀜
3. 빨간색이 된 뒤 클릭까지 걸린 시간을 ms로 측정해 결과 화면(초록색)에 표시
4. 결과 화면에서 닉네임을 입력하면 해당 기록이 Firebase에 저장됨
5. 빨간색이 되기 전에 클릭하면 실패 처리 후 재시작 가능
6. 결과 화면에는 최고 기록 TOP 5(랭킹)가 함께 표시됨

## 프로젝트 구조

```
src/
  firebase.js     # Firebase 초기화 (환경변수로 설정값 주입)
  scoreApi.js     # saveScore(nickname, ms), getTop(n) — DB 저장/조회 전담
  App.jsx         # 게임 화면/상태 전환 로직
  App.css
```

DB 관련 코드는 `scoreApi.js`의 두 함수로만 노출됩니다.

- `saveScore(nickname, ms)`: 닉네임과 기록(ms)을 저장
- `getTop(n)`: 가장 빠른 기록 상위 n개를 반환

## Firebase 설정 (필수)

이 저장소에는 Firebase 프로젝트의 실제 키가 들어있지 않습니다. 아래 순서대로
직접 프로젝트를 만들고 값을 채워야 정상적으로 저장/조회가 동작합니다.

### 1. Firebase 프로젝트 & 웹 앱 생성

1. https://console.firebase.google.com 접속 → "프로젝트 추가"로 새 프로젝트 생성
2. 프로젝트 개요 페이지에서 `</>` (웹 앱 추가) 클릭 → 앱 닉네임 입력 후 등록
3. 등록 완료 화면에 표시되는 `firebaseConfig` 값을 복사해둠 (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)

### 2. Firestore 활성화 및 보안 규칙 적용

1. 콘솔 왼쪽 메뉴 "빌드 > Firestore Database" → "데이터베이스 만들기"
2. 위치 선택 후 생성 (모드는 아무거나 선택해도 됨, 규칙은 다음 단계에서 덮어씀)
3. "규칙" 탭으로 이동 → 이 저장소의 `firestore.rules` 파일 내용을 그대로 붙여넣고 "게시"
   - 누구나 랭킹을 읽을 수 있고, 형식이 올바른 기록만 새로 추가할 수 있도록 제한합니다.

### 3. 로컬 개발 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열어 1단계에서 복사한 값을 채워 넣습니다.

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`.env.local`은 `.gitignore`에 등록되어 있어 커밋되지 않습니다.

### 4. GitHub Actions 배포용 Secrets 등록

GitHub Pages 배포 워크플로우(`.github/workflows/deploy.yml`)가 빌드 시 같은 값을
사용할 수 있도록, 저장소 Settings에도 동일한 값을 등록해야 합니다.

1. 저장소 → Settings → Secrets and variables → Actions → "New repository secret"
2. 아래 6개 이름으로 각각 값 등록:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## GitHub Pages 배포 설정

1. 저장소 → Settings → Pages
2. "Build and deployment" → Source를 **GitHub Actions**로 선택
3. `claude/reaction-time-webapp-4b5zlt` 브랜치(현재 저장소 기본 브랜치)에 push하면
   `.github/workflows/deploy.yml`이 자동으로 빌드/배포
   (직접 실행하려면 Actions 탭에서 "Deploy to GitHub Pages" 워크플로우를 수동 실행)

배포 후 주소는 `https://<GitHub 계정>.github.io/<저장소 이름>/` 형태입니다.
저장소 이름이 바뀌면 `vite.config.js`의 `base` 값도 함께 수정해야 합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
npm run preview
```
