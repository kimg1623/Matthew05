-- 마태복음 5장 암송 챌린지 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor에 전체를 붙여넣어 한 번에 실행하세요.
-- 실행 전에 Authentication > Providers > Email 에서 "Confirm email"을 꺼야
-- 가입(signUp) 직후 바로 로그인 세션이 생성됩니다 (가상 이메일이라 메일 수신 불가).

-- ─────────────────────────────────────────────
-- profiles: auth.users 1:1, 이름/학년(구분자)
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  grade text not null check (grade in ('중1', '중2', '중3', '고1', '고2', '고3', '교사')),
  created_at timestamptz not null default now(),
  unique (name)
);

alter table public.profiles enable row level security;

-- 리더보드에 이름/학년을 노출해야 하므로 로그인한 사용자 전체에게 조회 허용
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- 자기 자신의 프로필만 생성 가능 (가입 직후 1회)
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert on public.profiles to authenticated;

-- ─────────────────────────────────────────────
-- test_attempts: 셀프테스트 완료 기록 (append-only)
-- ─────────────────────────────────────────────
create table public.test_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  chapter int not null check (chapter between 1 and 8),
  mode text not null check (mode in ('order', 'cloze', 'blur')),
  correct int not null check (correct >= 0),
  total int not null check (total > 0 and correct <= total),
  gradable boolean not null,
  created_at timestamptz not null default now()
);

alter table public.test_attempts enable row level security;

-- 본인 기록만 조회/추가 가능 (전체 공개 집계는 아래 leaderboard 뷰를 통해서만 노출)
create policy "attempts_select_own"
  on public.test_attempts for select
  to authenticated
  using (user_id = auth.uid());

create policy "attempts_insert_own"
  on public.test_attempts for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.test_attempts to authenticated;

-- ─────────────────────────────────────────────
-- leaderboard: 전체 사용자 집계 뷰
-- 뷰 소유자(테이블 생성자) 권한으로 실행되는 "일반" 뷰이기 때문에
-- test_attempts가 본인 행만 SELECT 가능해도 뷰 내부에서는 전체를 집계할 수 있다.
-- ⚠️ 이 뷰에 `security_invoker = true`를 설정하지 말 것 — 설정하는 순간
--    호출자 권한으로 실행되어 각자 자기 행만 보이게 되고, 리더보드가 조용히 깨진다.
-- ─────────────────────────────────────────────
create view public.leaderboard as
select
  p.id as user_id,
  p.name,
  p.grade,
  count(distinct a.chapter) as completed_chapters,
  round(
    avg(case when a.gradable then a.correct::numeric / nullif(a.total, 0) end) * 100
  ) as avg_accuracy,
  count(a.id) as total_attempts
from public.profiles p
left join public.test_attempts a on a.user_id = p.id
group by p.id, p.name, p.grade;

grant select on public.leaderboard to authenticated;
-- Supabase는 public 스키마의 새 테이블/뷰에 기본적으로 anon 역할에도 SELECT를 자동 부여한다.
-- 뷰는 RLS를 타지 않으므로 이 기본 권한을 명시적으로 revoke하지 않으면 로그인 없이도 전체 조회가 가능해진다.
revoke select on public.leaderboard from anon;

-- ─────────────────────────────────────────────
-- attempt_feed: 개별 시도(attempt) 단위 조회용 뷰
-- 리더보드의 "날짜별보기"/"테스트별보기"에서 사용 (전체 사용자 attempt 목록 + 이름/학년 조인)
-- leaderboard와 동일한 이유로 일반 뷰(소유자 권한)로 만들고, anon 권한은 명시적으로 차단한다.
-- ─────────────────────────────────────────────
create view public.attempt_feed as
select
  a.id,
  a.user_id,
  p.name,
  p.grade,
  a.chapter,
  a.mode,
  a.correct,
  a.total,
  a.gradable,
  a.created_at
from public.test_attempts a
join public.profiles p on p.id = a.user_id;

grant select on public.attempt_feed to authenticated;
revoke select on public.attempt_feed from anon;
