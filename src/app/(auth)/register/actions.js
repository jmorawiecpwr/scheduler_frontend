'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function signup(prevState, formData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('full_name')
  const role = formData.get('role')      // 'dyrektor' | 'nauczyciel' | 'uczen'
  let schoolCode = formData.get('school_code')

  if (!email || !password || !fullName || !role) {
    return { error: 'Wszystkie pola są wymagane.' }
  }
  if (!['dyrektor', 'nauczyciel', 'uczen'].includes(role)) {
    return { error: 'Nieprawidłowa rola.' }
  }

  // 1) Rejestracja (tu nie licz na sesję)
  const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) return { error: signUpError.message }

  const user = authData?.user
  if (!user) return { error: 'Nie udało się utworzyć konta.' }

  // 2) Dyrektor generuje school_code, reszta musi podać istniejący
  if (role === 'dyrektor') {
    schoolCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  } else {
    if (!schoolCode) return { error: 'Kod szkoły jest wymagany.' }
    const { data: schoolExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('school_code', schoolCode)
      .limit(1)
    if (!schoolExists || schoolExists.length === 0) {
      return { error: 'Podany kod szkoły nie istnieje.' }
    }
  }

  // 3) ADMIN CLIENT – SERVICE ROLE (bypasuje RLS)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // musi być ustawiony w env (Server-only secret)
  )

  // 4) Zapis profilu przez RPC z p_user_id (nie zależymy od sesji)
  const { error: profileError } = await admin.rpc('save_profile', {
    p_user_id: user.id,
    p_full_name: fullName,
    p_role: role,
    p_school_code: schoolCode,
  })
  if (profileError) {
    return { error: `Błąd profilu: ${profileError.message}` }
  }

  // 5) Routing per rola (po weryfikacji maila user i tak trafi na stronę i będzie zalogowany)
  if (role === 'dyrektor') redirect('/dyrektor')
  if (role === 'nauczyciel') redirect('/nauczyciel')
  if (role === 'uczen') redirect('/uczen')
  redirect('/')
}
