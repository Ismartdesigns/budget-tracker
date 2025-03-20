"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getBudgetsForUser, getFinancialDataForUser } from "@/app/actions"

type CategorySpending = {
  category: string
  spent: number
  budget: number
  percentage: number
}

interface BudgetSummaryProps {
  userId: string
}

export default function BudgetSummary({ userId }: BudgetSummaryProps) {
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const financialData = await getFinancialDataForUser(userId)
        const budgets = await getBudgetsForUser(userId)

        // Calculate spending by category with budget comparison
        const categories = Object.keys(financialData.categorySummary)
        const spending: CategorySpending[] = []

        for (const category of categories) {
          const spent = financialData.categorySummary[category] || 0
          const budgetItem = budgets.find((b) => b.category === category)
          const budget = budgetItem?.amount || 0
          const percentage = budget > 0 ? (spent / budget) * 100 : 0

          spending.push({
            category,
            spent,
            budget,
            percentage,
          })
        }

        // Sort by highest percentage of budget used
        spending.sort((a, b) => b.percentage - a.percentage)
        setCategorySpending(spending.slice(0, 4)) // Show top 4 categories
      } catch (error) {
        console.error("Error fetching budget data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Summary</CardTitle>
        <CardDescription>Your spending against budget by category</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : categorySpending.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No budget data available. Create a budget to track your spending.
          </div>
        ) : (
          <div className="space-y-4">
            {categorySpending.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm">
                    ${item.spent.toFixed(2)} / ${item.budget.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded bg-gray-200">
                  <div
                    className={`absolute top-0 left-0 h-full rounded transition-all ${
                      item.percentage > 90
                        ? "bg-red-500"
                        : item.percentage > 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right text-muted-foreground">{item.percentage.toFixed(1)}% used</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
