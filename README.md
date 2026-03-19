# AI Powered QA Test Generator 🤖🧪

웹사이트 URL을 입력하면 페이지 구조를 분석하고, Google Gemini AI 모델을 활용하여 전문적인 단계별 QA 테스트 케이스를 1초 만에 자동으로 생성해주는 **AI 기반 QA 자동화 도구**입니다.

## 🚀 주요 기능 (Features)
- **URL 기반 페이지 분석**: 웹 페이지의 구조와 상호작용 가능한 주요 요소들을 효율적으로 추출합니다.
- **AI 테스트 케이스 생성**: 구글 최신 모델인 `gemini-2.5-flash`를 사용하여 핵심 유저 여정(로그인, 검색, 주요 탐색 등)에 알맞은 완성도 높은 테스트 시나리오를 도출합니다.
- **체계적인 Depth 구조 지원**: 단순 평면적 목록이 아닌 `1 Depth` ~ `5 Depth`에 이르는 계층적이고 체계적인 구조로 화면/기능을 분류합니다.
- **모던하고 직관적인 UI**: Tailwind CSS 및 Framer Motion을 활용하여 다크 테마 기반의 고급스러운 유저 인터페이스와 세련된 애니메이션을 제공합니다.
- **CSV 추출 기능**: 화면에서 확인한 전체 테스트 케이스를 클릭 한 번으로 `.csv` Excel 파일로 즉시 다운로드하여 실무에 바로 활용할 수 있습니다.

## 📋 제공 테스트 항목 (Output Columns)
AI가 생성하고 화면에 표시하는 테이블 양식은 다음과 같습니다:
- `No.` (순번)
- `URL` (테스트 대상 페이지 URL)
- `1 Depth` ~ `5 Depth` (기능 위치 분류)
- `Pre-Condition` (테스트 이전 필수 수행 전제 조건)
- `Test Step` (수행해야 할 테스트 단계)
- `Expected Result` (기대 결과)
- `Result` (진행 결과란 - 초기값 빈칸 제공)

## 🛠️ 주요 기술 스택 (Tech Stack)
- **Frontend Framework**: Next.js 16 (App Router), React 19
- **Styling / Animation**: Tailwind CSS v4, Framer Motion, Lucide React
- **Web Scraping**: Playwright
- **AI SDK**: @google/generative-ai (Gemini)

## ⚙️ 로컬 환경 설정 및 실행 방법 (Getting Started)

### 1. 환경 변수 (API 키) 셋팅
프로젝트 최상위 디렉토리에 `.env.local` 파일을 만들고, 본인의 Gemini API 키를 기록합니다. 
(API 키는 [Google AI Studio](https://aistudio.google.com/)에서 무료로 발급받을 수 있습니다.)

```env
# .env.local
GEMINI_API_KEY=본인의_실제_API_키_입력
```

### 2. 필요 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 접속
서버가 구동되면 브라우저에서 [http://localhost:3000](http://localhost:3000) 에 접속하여 바로 서비스를 이용하실 수 있습니다.
