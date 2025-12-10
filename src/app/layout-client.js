'use client'

import { useState, useEffect } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export default function RootLayoutClient({ children }) {
    const [supabaseClient] = useState(() => createPagesBrowserClient())
    const [session, setSession] = useState(null)

    // 🔥 Pobierz sesję po stronie klienta
    useEffect(() => {
        supabaseClient.auth.getSession().then(({ data }) => {
            setSession(data.session)
        })
    }, [supabaseClient])

    return (
        <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
                {children}
            </SessionContextProvider>
        </div>
    )
}