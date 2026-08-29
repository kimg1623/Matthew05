import { supabase } from '@/lib/supabase'
import type { Grade } from '@/lib/auth'

type UpdateResult = { ok: true } | { ok: false; message: string }

export async function updateStudent(
  targetUserId: string,
  updates: { name?: string; grade?: Grade; pin?: string },
): Promise<UpdateResult> {
  const { data, error } = await supabase.functions.invoke('admin-update-student', {
    body: { targetUserId, newName: updates.name, newGrade: updates.grade, newPin: updates.pin },
  })

  if (error) {
    return { ok: false, message: '요청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
  }
  if (!data?.ok) {
    return { ok: false, message: (data?.error as string) ?? '변경에 실패했어요.' }
  }
  return { ok: true }
}
