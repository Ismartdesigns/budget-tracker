"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface SecuritySettingsProps {
  userId: string
}

export default function SecuritySettings({ userId }: SecuritySettingsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSwitchChange = (name: string) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would update the security settings in the database
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Security settings updated",
        description: "Your security preferences have been updated successfully.",
        variant: "success",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating security settings:", error)

      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, this would update the password in the database
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "success",
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)

      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSecuritySubmit} className="space-y-6">
        <h3 className="text-lg font-medium">Security Options</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out after 30 minutes of inactivity.</p>
            </div>
            <Switch
              id="session-timeout"
              checked={settings.sessionTimeout}
              onCheckedChange={() => handleSwitchChange("sessionTimeout")}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Security Settings"}
          </Button>
        </div>
      </form>

      <Separator />

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <h3 className="text-lg font-medium">Change Password</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long and include a number and a special character.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  )
}

