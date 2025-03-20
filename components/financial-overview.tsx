"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet } from "lucide-react"
import { getFinancialDataForUser } from "@/app/actions"

interface FinancialOverviewProps {
  userId: string
}

export default function FinancialOverview({ userId }: FinancialOverviewProps) {
  const [data, setData] = useState({
    totalSpent: 0,
    totalBudget: 0,
    remainingBudget: 0,
    percentUsed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const financialData = await getFinancialDataForUser(userId)
        const remainingBudget = financialData.totalBudget - financialData.totalSpent
        const percentUsed =
          financialData.totalBudget > 0 ? (financialData.totalSpent / financialData.totalBudget) * 100 : 0

        setData({
          totalSpent: financialData.totalSpent,
          totalBudget: financialData.totalBudget,
          remainingBudget,
          percentUsed,
        })
      } catch (error) {
        console.error("Error fetching financial data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <>
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalSpent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalBudget.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Monthly allocation</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.remainingBudget.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Available to spend</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.percentUsed.toFixed(1)}%</div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${
                data.percentUsed > 90 ? "bg-red-500" : data.percentUsed > 75 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(data.percentUsed, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

