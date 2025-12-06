# TubeScript AI

유튜브 스크립트 생성을 위한 AI 기반 도구입니다. Google Gemini AI를 활용하여 아이디어를 완성된 유튜브 대본으로 변환합니다.

## 기능

- 📝 **스크립트 분석**: 입력한 아이디어를 분석하여 톤, 타겟 시청자, 핵심 테마를 파악
- 💡 **주제 제안**: 바이럴 가능성이 높은 5가지 비디오 주제 자동 생성
- ✍️ **대본 생성**: 선택한 주제에 대한 완성도 높은 유튜브 대본 작성
- 🔐 **API 키 관리**: 로컬 스토리지를 활용한 안전한 API 키 저장 및 관리

## 배포 방법

### Vercel 배포

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com)에 접속하여 로그인
3. "New Project" 클릭
4. GitHub 저장소 연결
5. 프로젝트 선택 후 배포

### 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 설정

API 키는 애플리케이션 내에서 직접 설정할 수 있습니다:

1. 앱 실행 후 우측 상단의 API 키 입력란 클릭
2. Gemini API 키 입력
3. "저장" 버튼 클릭
4. API 키는 브라우저의 localStorage에 안전하게 저장됩니다

## Gemini API 키 발급

1. [Google AI Studio](https://ai.google.dev/aistudio) 접속
2. "Get API Key" 클릭
3. API 키 생성 및 복사

## 기술 스택

- **React 19** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Google Gemini AI** - AI 대본 생성
- **Lucide React** - 아이콘

## 라이선스

MIT License

---

Powered by Google Gemini AI 🚀

