"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCurrency } from "@/context/currency-context"

type User = {
  id: string
  name: string
  email: string
}

interface GeneralSettingsProps {
  user: User
}

export default function GeneralSettings({ user }: GeneralSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { currentCurrency, setCurrency, currencies, isLoading: isLoadingCurrencies } = useCurrency()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [settings, setSettings] = useState({
    currency: currentCurrency.code || "USD",
    theme: "light",
    enableAnalytics: true,
  })

  // Update the settings currency when the context currency changes
  useEffect(() => {
    if (currentCurrency.code) {
      setSettings(prev => ({ ...prev, currency: currentCurrency.code }))
    }
  }, [currentCurrency])

  const handleSwitchChange = (name: string) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would update the user settings in the database
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Update the currency in the context so it's available app-wide
      setCurrency(settings.currency)
      
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
        variant: "success",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating settings:", error)

      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(currency => 
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Show a selected currency even if it's not in our list
  const selectedCurrencyDisplay = () => {
    const found = currencies.find(c => c.code === settings.currency)
    if (found) return found.name
    if (settings.currency === "USD") return "US Dollar"
    return `${settings.currency}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={settings.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
            <SelectTrigger id="currency" disabled={isLoadingCurrencies}>
              <SelectValue placeholder="Select currency">
                {isLoadingCurrencies ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading currencies...
                  </div>
                ) : (
                  selectedCurrencyDisplay()
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {isLoadingCurrencies ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading currencies...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center px-3 pb-2">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search currencies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <ScrollArea className="h-72">
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex justify-between w-full">
                            <span>{currency.name}</span>
                            <span className="text-muted-foreground">{currency.symbol} ({currency.code})</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No currencies found
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics">Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Allow us to collect anonymous usage data to improve the application.
            </p>
          </div>
          <Switch
            id="analytics"
            checked={settings.enableAnalytics}
            onCheckedChange={() => handleSwitchChange("enableAnalytics")}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}