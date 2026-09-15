# 마태복음 5장 암송 챌린지

WING 청소년부를 위한 마태복음 5장(8주차, 48절) 암송 모바일 웹앱입니다.
이름 + PIN 4자리로 로그인하고, 3가지 방식으로 셀프테스트를 진행하며, 여러 기기에서 진도가 동기화됩니다.

> 이 프로젝트는 [Claude](https://claude.com/claude-code)와 함께 바이브 코딩(vibe coding)으로 만들어졌습니다.

## 주요 기능

- **성경 읽기** — 절마다 고유 아이콘과 주차별 포인트 컬러로 구성된 8주차 화면
- **셀프테스트 3종** — 단어 배치 / 빈칸 채우기 / 문장 가리기
- **로그인** — 이메일·비밀번호 없이 이름 + PIN(4자리) + 학년만으로 가입/로그인, 여러 기기 진도 동기화
- **리더보드** (교사 전용) — 전체보기 / 날짜별보기(자동·수동 새로고침) / 테스트별보기, 학생 정보 수정
- **MY** — 개인 챕터별 완료 현황과 최근 활동 기록
- **업적 뱃지 컬렉션** — 출석 스트릭, 챕터별 퀘스트 완료, 도전 과제를 뱃지로 모아보기
- **오프라인 대비** — 테스트 완료 저장이 실패해도 기기에 큐로 남겨두었다가 자동 재전송

## 기술 스택

- Vite + React 18 + TypeScript + Tailwind CSS (SPA, `react-router-dom`)
- [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security
- Vercel 배포

## 시작하기

```bash
npm install
```

`.env`(또는 `.env.local`)에 Supabase 프로젝트 정보를 설정합니다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

Supabase 대시보드의 SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql)을 한 번 실행해 테이블/뷰/정책을 준비하고, Authentication > Providers > Email에서 "Confirm email"을 꺼주세요 (가상 이메일이라 메일 수신이 불가능합니다).

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
```

## 배포

Vercel에 이 저장소를 연결하고 위 두 환경변수만 설정하면 됩니다.
