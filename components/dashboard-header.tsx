"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TrendingUp, Menu, User, LogOut } from "lucide-react"
import { logoutUser } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

type UserType = {
  id: string
  name: string
  email: string
} | null // Allow `null` in case user is not logged in

interface DashboardHeaderProps {
  user: UserType
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export default function DashboardHeader({ user, mobileOpen = false, setMobileOpen }: DashboardHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logoutUser()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "success",
    })
    router.push("/login")
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    if (setMobileOpen) {
      setMobileOpen(!mobileOpen)
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="hidden md:inline-block">BudgetAI</span>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
