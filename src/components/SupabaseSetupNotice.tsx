export default function SupabaseSetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center bg-cream px-6 text-center">
      <div className="text-lg font-extrabold text-navy">Supabase 설정이 필요해요</div>
      <div className="mt-3 text-[13px] leading-relaxed text-text-muted">
        <code className="rounded bg-cream-dark px-1.5 py-0.5">.env.local</code> 파일에{' '}
        <code className="rounded bg-cream-dark px-1.5 py-0.5">VITE_SUPABASE_URL</code>,{' '}
        <code className="rounded bg-cream-dark px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code>를 설정한 뒤 개발 서버를
        다시 시작해주세요.
      </div>
      <div className="mt-4 text-[12.5px] leading-relaxed text-text-muted">
        supabase/schema.sql을 프로젝트의 SQL Editor에서 실행하고, Authentication → Providers → Email에서 "Confirm
        email"을 꺼두는 것도 잊지 마세요.
      </div>
    </div>
  )
}
