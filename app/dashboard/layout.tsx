"use client"

import { useEffect, useState } from "react"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { getCurrentUser } from "@/app/actions"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1">
        <DashboardSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
