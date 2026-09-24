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

-- ─────────────────────────────────────────────
-- event_progress: "암송집중데이"(성경구절쌓기) 교실용 실시간 말판 게임 상태.
-- test_attempts와 완전히 분리된, 언제든 리셋 가능한 일회성 게임 상태다 (영구 기록 아님).
-- 공유화면(/focus-racing 등)이 로그인 없이 실시간 구독해야 하므로 anon도 읽을 수 있다.
-- 클라이언트가 UPDATE로 position을 임의 조작하지 못하도록 UPDATE 정책을 아예 두지 않고,
-- "현재 위치+1만" 허용하는 increment_event_progress() RPC로만 전진시킨다.
-- 학생이 고른 방식(mode)은 set_own_event_mode() RPC로만 기록한다(null = 방식 고르는 중).
-- 라운드 전체 리셋(새 범위로 열기/종료)은 open/close-event-round 엣지 함수(service role)로만 가능하다.
-- ─────────────────────────────────────────────
create table public.event_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  position int not null default 0 check (position >= 0 and position <= 48),
  updated_at timestamptz not null default now(),
  mode text check (mode in ('all', 'one')),
  created_at timestamptz not null default now()
);

alter table public.event_progress enable row level security;

create policy "event_progress_select_authenticated"
  on public.event_progress for select to authenticated using (true);
create policy "event_progress_select_anon"
  on public.event_progress for select to anon using (true);

-- 학생이 이벤트 화면에 처음 들어올 때 자기 행을 0으로 1회 생성
create policy "event_progress_insert_own_at_zero"
  on public.event_progress for insert
  to authenticated
  with check (user_id = auth.uid() and position = 0);

-- "돌아가기"로 참여화면을 나가면 본인 행을 지워서 공유화면 말판에서도 사라지게 한다
create policy "event_progress_delete_own"
  on public.event_progress for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.event_progress to authenticated;
grant select on public.event_progress to anon;
-- ⚠️ UPDATE 정책은 의도적으로 없음 — 전진/리셋은 아래 RPC로만.

-- ─────────────────────────────────────────────
-- event_round: 지금 라운드가 열려있는지 + 절 범위(시작절~끝절)를 담는 싱글턴 행.
-- 공유화면(anon)과 참여화면(authenticated) 둘 다 실시간 구독한다.
-- 쓰기는 open-event-round / close-event-round 엣지 함수(service role)로만.
-- ─────────────────────────────────────────────
create table public.event_round (
  id boolean primary key default true,
  is_open boolean not null default false,
  start_verse int,
  end_verse int,
  updated_at timestamptz not null default now(),
  constraint event_round_singleton check (id),
  constraint event_round_range check (
    (is_open = false and start_verse is null and end_verse is null)
    or (is_open = true and start_verse is not null and end_verse is not null
        and start_verse <= end_verse and start_verse >= 1 and end_verse <= 48)
  )
);

insert into public.event_round (id, is_open) values (true, false);

alter table public.event_round enable row level security;
create policy "event_round_select_all"
  on public.event_round for select to anon, authenticated using (true);
grant select on public.event_round to anon, authenticated;
-- 쓰기 정책 없음 — open-event-round / close-event-round 엣지 함수(service role)로만 변경.

-- 공유화면(로그인 없음) 전용 뷰: 참가자의 이름 + 위치 + 고른 방식 + 접속 시각만 노출한다.
-- profiles 테이블 자체는 anon에게 열려있지 않으므로(authenticated만 select 가능),
-- event_progress에 profiles를 직접 embed하면 anon 요청에서는 이름이 비어 온다 —
-- 이 뷰는 소유자 권한으로 실행되는 일반 뷰라 그 제한을 우회해 이름만 안전하게 노출한다.
-- leaderboard/attempt_feed와 반대로 이 뷰는 anon에게도 의도적으로 공개한다.
create view public.event_board as
select ep.user_id, ep.position, p.name, ep.mode, ep.created_at
from public.event_progress ep
join public.profiles p on p.id = ep.user_id;

grant select on public.event_board to anon, authenticated;

create or replace function public.increment_event_progress(p_expected_position int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_position int;
  v_round_len int;
begin
  select (end_verse - start_verse + 1) into v_round_len
  from public.event_round where id = true and is_open = true;

  if v_round_len is null then
    return null; -- 열린 라운드가 없으면 아무것도 하지 않는다
  end if;

  update public.event_progress
  set position = p_expected_position + 1, updated_at = now()
  where user_id = auth.uid()
    and position = p_expected_position
    and p_expected_position < v_round_len
  returning position into v_new_position;

  return v_new_position; -- 조건이 안 맞으면(중복 호출/경쟁 상황) null
end;
$$;

revoke all on function public.increment_event_progress(int) from public;
grant execute on function public.increment_event_progress(int) to authenticated;

-- 학생이 방식을 고르면 공유화면에 방식 뱃지가 뜬다. p_mode가 null이면
-- "모드 선택으로 돌아가기" — 방식을 비우고 쌓은 개수도 0으로 되돌린다(접속 상태는 유지).
-- 다른 사람 행은 절대 건드릴 수 없음 — auth.uid()로 고정.
create or replace function public.set_own_event_mode(p_mode text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_mode is not null and p_mode not in ('all', 'one') then
    raise exception 'invalid mode';
  end if;

  update public.event_progress
  set mode = p_mode,
      position = case when p_mode is null then 0 else position end,
      updated_at = now()
  where user_id = auth.uid();
end;
$$;

revoke all on function public.set_own_event_mode(text) from public;
grant execute on function public.set_own_event_mode(text) to authenticated;

-- ⚠️ event_progress와 event_round 둘 다, Supabase 대시보드 Database > Replication에서
--    Replication을 반드시 켜야 postgres_changes 실시간 구독이 동작한다.
