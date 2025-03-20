"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExpensesForUser } from "@/app/actions"
import { formatDistanceToNow } from "date-fns"
import type { Expense } from "@/lib/db"

interface RecentTransactionsProps {
  userId: string
}

export default function RecentTransactions({ userId }: RecentTransactionsProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const fetchedExpenses = await getExpensesForUser(userId)
        setExpenses(fetchedExpenses)
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [userId])

  // Function to get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-green-100 text-green-800",
      Transportation: "bg-blue-100 text-blue-800",
      Housing: "bg-purple-100 text-purple-800",
      Entertainment: "bg-pink-100 text-pink-800",
      Shopping: "bg-yellow-100 text-yellow-800",
      Utilities: "bg-indigo-100 text-indigo-800",
      Healthcare: "bg-red-100 text-red-800",
    }

    return colors[category] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest expenses</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent transactions found. Add your first expense to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense._id?.toString()} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full p-2 bg-gray-100">
                    <div className="h-8 w-8 flex items-center justify-center">{expense.category.charAt(0)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">${expense.amount.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

