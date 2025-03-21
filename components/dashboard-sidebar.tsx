"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { BarChart3, CreditCard, DollarSign, Home, PieChart, Settings, TrendingUp, User, X } from "lucide-react"

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  title: string
  onClick?: () => void
}

function SidebarLink({ href, icon, title, onClick }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} passHref onClick={onClick}>
      <Button variant="ghost" className={cn("w-full justify-start gap-2", isActive && "bg-muted font-medium")}>
        {icon}
        <span>{title}</span>
      </Button>
    </Link>
  )
}

// This is a new interface to accept the mobile menu state from the parent
interface DashboardSidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export default function DashboardSidebar({ mobileOpen = false, setMobileOpen }: DashboardSidebarProps) {
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile when the component mounts
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the md breakpoint in Tailwind
    }

    // Check initially
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Function to close mobile menu when a link is clicked
  const handleLinkClick = () => {
    if (isMobile && setMobileOpen) {
      setMobileOpen(false)
    }
  }

  // The sidebar content - we'll reuse this in both desktop and mobile views
  const sidebarContent = (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between py-2">
        <h2 className="px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen?.(false)} className="md:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <SidebarLink href="/dashboard" icon={<Home className="h-4 w-4" />} title="Overview" onClick={handleLinkClick} />
        <SidebarLink
          href="/dashboard/expenses"
          icon={<CreditCard className="h-4 w-4" />}
          title="Expenses"
          onClick={handleLinkClick}
        />
        <SidebarLink
          href="/dashboard/budgets"
          icon={<DollarSign className="h-4 w-4" />}
          title="Budgets"
          onClick={handleLinkClick}
        />
        <SidebarLink
          href="/dashboard/insights"
          icon={<TrendingUp className="h-4 w-4" />}
          title="AI Insights"
          onClick={handleLinkClick}
        />
        <SidebarLink
          href="/dashboard/reports"
          icon={<BarChart3 className="h-4 w-4" />}
          title="Reports"
          onClick={handleLinkClick}
        />
      </div>
      <div className="space-y-1 pt-4">
        <SidebarLink
          href="/dashboard/profile"
          icon={<User className="h-4 w-4" />}
          title="Profile"
          onClick={handleLinkClick}
        />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden border-r bg-background md:block md:w-64">{sidebarContent}</aside>

      {/* Mobile sidebar using Sheet component */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}

