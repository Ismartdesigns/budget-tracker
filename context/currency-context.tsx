"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface Currency {
  code: string
  name: string
  symbol: string
}

interface CurrencyContextType {
  currentCurrency: Currency
  setCurrency: (currencyCode: string) => void
  currencies: Currency[]
  isLoading: boolean
}

const defaultCurrency: Currency = { code: "USD", name: "US Dollar", symbol: "$" }

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: defaultCurrency,
  setCurrency: () => {},
  currencies: [],
  isLoading: true
})

export const useCurrency = () => useContext(CurrencyContext)

interface CurrencyProviderProps {
  children: ReactNode
  initialCurrency?: string
}

export const CurrencyProvider = ({ children, initialCurrency = "USD" }: CurrencyProviderProps) => {
  const { toast } = useToast()
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrency)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mapping of currency codes to symbols (expanded)
  const currencySymbols: Record<string, string> = {
    "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", "CAD": "C$",
    "AUD": "A$", "CNY": "¥", "INR": "₹", "BRL": "R$", "RUB": "₽",
    "KRW": "₩", "MXN": "Mex$", "CHF": "Fr", "SGD": "S$", "HKD": "HK$",
    "SEK": "kr", "NOK": "kr", "DKK": "kr", "PLN": "zł", "ZAR": "R",
    "NZD": "NZ$", "THB": "฿", "TRY": "₺", "IDR": "Rp", "MYR": "RM",
    "PHP": "₱", "CZK": "Kč", "HUF": "Ft", "ILS": "₪", "AED": "د.إ",
    "ARS": "$", "CLP": "$", "COP": "$", "EGP": "£", "ISK": "kr",
    "KWD": "د.ك", "LKR": "₨", "MAD": "د.م.", "NGN": "₦", "PKR": "₨",
    "QAR": "﷼", "RON": "lei", "SAR": "﷼", "TWD": "NT$", "UAH": "₴",
    "VND": "₫"
  }

  useEffect(() => {
    // Check if we have a stored currency preference
    const storedCurrency = localStorage.getItem('userCurrency')
    const currencyToUse = storedCurrency || initialCurrency
    
    const fetchCurrencies = async () => {
      // Set timeout for fetch operation
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
      
      try {
        // Using currency API from frankfurter.app which is reliable and free
        const response = await fetch('https://api.frankfurter.app/currencies', {
          signal: controller.signal
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch currencies: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Process currency data
        const currencyList: Currency[] = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string,
          symbol: getCurrencySymbol(code)
        })).sort((a, b) => a.name.localeCompare(b.name))
        
        setCurrencies(currencyList)
        
        // Set the initial currency
        const initialCurrencyData = currencyList.find(c => c.code === currencyToUse) || 
                                    { code: currencyToUse, name: getNameForCode(currencyToUse), symbol: getCurrencySymbol(currencyToUse) }
        setCurrentCurrency(initialCurrencyData)
        
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Error fetching currencies:', error)
        
        // Use alternative API as backup
        try {
          const backupResponse = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json', {
            signal: controller.signal
          })
          
          if (!backupResponse.ok) {
            throw new Error(`Failed to fetch from backup source: ${backupResponse.status}`)
          }
          
          const backupData = await backupResponse.json()
          
          // Process currency data from backup source
          const currencyList: Currency[] = Object.entries(backupData).map(([code, name]) => ({
            code,
            name: typeof name === 'string' ? name : code,
            symbol: getCurrencySymbol(code)
          })).sort((a, b) => a.name.localeCompare(b.name))
          
          setCurrencies(currencyList)
          
          // Set the initial currency
          const initialCurrencyData = currencyList.find(c => c.code === currencyToUse) || 
                                      { code: currencyToUse, name: getNameForCode(currencyToUse), symbol: getCurrencySymbol(currencyToUse) }
          setCurrentCurrency(initialCurrencyData)
        } catch (backupError) {
          console.error('Error fetching from backup source:', backupError)
          
          if (error instanceof Error && error.name !== 'AbortError') {
            toast({
              title: "Connection issue",
              description: "Could not fetch currency data. Please check your connection.",
              variant: "destructive",
            })
          }
          
          // At least ensure the current currency is valid
          setCurrentCurrency({ 
            code: currencyToUse, 
            name: getNameForCode(currencyToUse), 
            symbol: getCurrencySymbol(currencyToUse) 
          })
        }
      } finally {
        setIsLoading(false)
        clearTimeout(timeoutId)
      }
    }
    
    fetchCurrencies()
  }, [initialCurrency, toast])

  // Get a reasonable name for a currency code if we don't have its official name
  const getNameForCode = (code: string): string => {
    const commonNames: Record<string, string> = {
      "USD": "US Dollar",
      "EUR": "Euro",
      "GBP": "British Pound",
      "JPY": "Japanese Yen",
      "CAD": "Canadian Dollar",
      "AUD": "Australian Dollar",
      "CNY": "Chinese Yuan"
    }
    
    return commonNames[code] || `${code} Currency`
  }

  // Get currency symbol from the mapping or fallback to code
  const getCurrencySymbol = (code: string): string => {
    return currencySymbols[code] || code
  }

  const setCurrency = (currencyCode: string) => {
    // Find the currency in our list or create a generic entry
    const currency = currencies.find(c => c.code === currencyCode) || 
                    { code: currencyCode, name: getNameForCode(currencyCode), symbol: getCurrencySymbol(currencyCode) }
    
    setCurrentCurrency(currency)
    
    // Store the selected currency in localStorage for persistence
    localStorage.setItem('userCurrency', currencyCode)
  }

  return (
    <CurrencyContext.Provider value={{ currentCurrency, setCurrency, currencies, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}