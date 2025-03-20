"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowDownIcon, TrendingDown } from "lucide-react"

type FinancialData = {
  expenses: any[]
  budgets: any[]
  totalSpent: number
  totalBudget: number
  categorySummary: Record<string, number>
}

type SavingOpportunity = {
  category: string
  amount: number
  potentialSavings: number
  percentage: number
}

interface SavingRecommendationsProps {
  data: FinancialData
}

export default function SavingRecommendations({ data }: SavingRecommendationsProps) {
  const [opportunities, setOpportunities] = useState<SavingOpportunity[]>([])

  useEffect(() => {
    // Calculate potential savings opportunities
    const categories = Object.keys(data.categorySummary)
    const savingOpportunities: SavingOpportunity[] = []

    categories.forEach((category) => {
      const spent = data.categorySummary[category] || 0

      // Find budget for this category
      const budget = data.budgets.find((b) => b.category === category)

      if (budget && spent > 0) {
        // If spending is over budget, suggest reducing to budget amount
        if (spent > budget.amount) {
          const potentialSavings = spent - budget.amount
          const percentage = (potentialSavings / spent) * 100

          savingOpportunities.push({
            category,
            amount: spent,
            potentialSavings,
            percentage,
          })
        }
        // If spending is high but under budget, suggest reducing by 10%
        else if (spent > budget.amount * 0.8) {
          const potentialSavings = spent * 0.1 // 10% reduction
          const percentage = 10 // 10%

          savingOpportunities.push({
            category,
            amount: spent,
            potentialSavings,
            percentage,
          })
        }
      } else if (spent > 0) {
        // No budget set, suggest 15% reduction for high-spending categories
        const potentialSavings = spent * 0.15 // 15% reduction
        const percentage = 15 // 15%

        savingOpportunities.push({
          category,
          amount: spent,
          potentialSavings,
          percentage,
        })
      }
    })

    // Sort by highest potential savings
    savingOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings)
    setOpportunities(savingOpportunities.slice(0, 3)) // Show top 3 opportunities
  }, [data])

  return (
    <Card>
      <CardContent className="p-6">
        {opportunities.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Add more expenses and budgets to get saving recommendations
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <span>Saving Opportunities</span>
            </div>

            <div className="space-y-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{opportunity.category}</span>
                    <span className="text-sm flex items-center gap-1 text-green-600">
                      <ArrowDownIcon className="h-3 w-3" />${opportunity.potentialSavings.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={opportunity.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Reduce spending by {opportunity.percentage.toFixed(0)}% to save $
                    {opportunity.potentialSavings.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-sm text-center text-muted-foreground pt-2">
              Total potential monthly savings: $
              {opportunities.reduce((sum, o) => sum + o.potentialSavings, 0).toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

