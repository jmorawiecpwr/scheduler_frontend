'use client'

import { useEffect } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function RedirectPage() {
    const router = useRouter()
    const supabase = createPagesBrowserClient()

    useEffect(() => {
        const redirectBasedOnRole = async () => {
            const {
                data: { session }
            } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login')
                return
            }

            const user = session.user
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile) {
                router.push('/login')
                return
            }

            if (profile.role === 'dyrektor') router.push('/dyrektor')
            else if (profile.role === 'nauczyciel') router.push('/nauczyciel')
            else router.push('/uczen')
        }

        redirectBasedOnRole()
    }, [])

    return <p className="p-4">Przekierowuję Cię do panelu... 🧠</p>
}