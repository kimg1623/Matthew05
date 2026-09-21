import { useNavigate } from 'react-router-dom'

// 링크로 바로 들어온 경우(앱 내부 히스토리가 없는 경우)엔 navigate(-1)이 아무 일도 하지 못해서,
// react-router가 history.state.idx에 기록해 두는 "이 탭에서 앱이 만든 히스토리 위치"로 판단해 fallback으로 보낸다.
export function useSmartBack(fallback = '/') {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
}
