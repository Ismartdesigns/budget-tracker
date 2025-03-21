// CHANGED: New component to handle client-side mobile menu state
"use client"

import type React from "react"

import { useState } from "react"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"

type UserType = {
  id: string
  name: string
  email: string
}

interface DashboardShellProps {
  user: UserType
  children: React.ReactNode
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  // CHANGED: State for mobile menu moved here from layout
  const [mobileOpen, setMobileOpen] = useState(false)

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

