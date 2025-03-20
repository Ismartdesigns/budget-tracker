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

type User = {
  id: string
  name: string
  email: string
}

interface Currency {
  code: string
  name: string
  symbol: string
}

interface GeneralSettingsProps {
  user: User
}

export default function GeneralSettings({ user }: GeneralSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [settings, setSettings] = useState({
    currency: "USD",
    theme: "light",
    enableAnalytics: true,
  })

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        // Fetch currencies from an API
        const response = await fetch('https://openexchangerates.org/api/currencies.json')
        
        if (!response.ok) {
          throw new Error('Failed to fetch currencies')
        }
        
        const data = await response.json()
        
        // Transform the data into the format we need
        const currencyList: Currency[] = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string,
          symbol: getCurrencySymbol(code)
        })).sort((a, b) => a.name.localeCompare(b.name))
        
        setCurrencies(currencyList)
      } catch (error) {
        console.error('Error fetching currencies:', error)
        toast({
          title: "Error",
          description: "Failed to load currencies. Using default options.",
          variant: "destructive",
        })
        
        // Fallback to default currencies
        setCurrencies([
          { code: "USD", name: "US Dollar", symbol: "$" },
          { code: "EUR", name: "Euro", symbol: "€" },
          { code: "GBP", name: "British Pound", symbol: "£" },
          { code: "JPY", name: "Japanese Yen", symbol: "¥" },
          { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
          { code: "AUD", name: "Australian Dollar", symbol: "A$" },
          { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
          { code: "INR", name: "Indian Rupee", symbol: "₹" },
          { code: "BRL", name: "Brazilian Real", symbol: "R$" },
          { code: "RUB", name: "Russian Ruble", symbol: "₽" },
        ])
      } finally {
        setIsLoadingCurrencies(false)
      }
    }
    
    fetchCurrencies()
  }, [toast])

  // Helper function to get currency symbols
  const getCurrencySymbol = (code: string): string => {
    const symbols: Record<string, string> = {
      "USD": "$",
      "EUR": "€",
      "GBP": "£",
      "JPY": "¥",
      "CAD": "C$",
      "AUD": "A$",
      "CNY": "¥",
      "INR": "₹",
      "BRL": "R$",
      "RUB": "₽",
      "KRW": "₩",
      "MXN": "Mex$",
      "CHF": "Fr",
      "SGD": "S$",
      "HKD": "HK$",
      "SEK": "kr",
      "NOK": "kr",
      "DKK": "kr",
      "PLN": "zł",
      "ZAR": "R",
    }
    
    return symbols[code] || code
  }

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
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // You would typically update global state or context here
      // to reflect the new currency across the application
      
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
                  currencies.find(c => c.code === settings.currency)?.name || "Select currency"
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