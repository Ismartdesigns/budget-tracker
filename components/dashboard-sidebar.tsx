"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, CreditCard, DollarSign, Home, User, PieChart, Settings, TrendingUp } from "lucide-react"

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  title: string
}

function SidebarLink({ href, icon, title }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} passHref>
      <Button variant="ghost" className={cn("w-full justify-start gap-2", isActive && "bg-muted font-medium")}>
        {icon}
        <span>{title}</span>
      </Button>
    </Link>
  )
}

export default function DashboardSidebar() {
  return (
    <aside className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="py-2">
          <h2 className="px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex-1 space-y-1">
          <SidebarLink href="/dashboard" icon={<Home className="h-4 w-4" />} title="Overview" />
          <SidebarLink href="/dashboard/expenses" icon={<CreditCard className="h-4 w-4" />} title="Expenses" />
          <SidebarLink href="/dashboard/budgets" icon={<DollarSign className="h-4 w-4" />} title="Budgets" />
          <SidebarLink href="/dashboard/insights" icon={<TrendingUp className="h-4 w-4" />} title="AI Insights" />
          <SidebarLink href="/dashboard/reports" icon={<BarChart3 className="h-4 w-4" />} title="Reports" />
        </div>
        <div className="space-y-1 pt-4">
          <SidebarLink href="/dashboard/profile" icon={<User className="h-4 w-4" />} title="Profile" />
          {/* <SidebarLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} title="Settings" /> */}
        </div>
      </div>
    </aside>
  )
}

