'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
    const supabase = await createClient()
    const email = formData.get('email')
    const password = formData.get('password')

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error || !data.user) {
        console.error('Błąd logowania:', error?.message)
        redirect('/login?error=1')
    }

    const user = data.user

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.role) {
        console.error('Błąd pobierania roli:', profileError?.message)
        redirect('/login?error=2')
    }

    // 🔁 Przekierowanie na podstawie roli
    let redirectPath = '/login'
    switch (profile.role) {
        case 'dyrektor':
            redirectPath = '/dyrektor'
            break
        case 'nauczyciel':
            redirectPath = '/nauczyciel'
            break
        case 'uczen':
            redirectPath = '/uczen'
            break
        default:
            redirectPath = '/login'
    }

    revalidatePath('/', 'layout')
    redirect(redirectPath)
}