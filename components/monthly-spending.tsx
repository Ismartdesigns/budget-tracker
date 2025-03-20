"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { getMonthlyFinancialDataForUser } from "@/app/actions"
import { Loader } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface MonthlySpendingProps {
  userId: string
}

export default function MonthlySpending({ userId }: MonthlySpendingProps) {
  const [monthlyData, setMonthlyData] = useState<{ month: string; budget: number; spent: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        if (!userId) throw new Error("User ID is required")

        const data = await getMonthlyFinancialDataForUser(userId)

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format")
        }

        setMonthlyData(data)
      } catch (err) {
        console.error("Error fetching monthly data:", err)
        setError("Failed to load financial data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-40 w-full bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Ensure valid data for Chart.js
  const labels = monthlyData.map(data => data.month)
  const budgetData = monthlyData.map(data => data.budget || 0)
  const spentData = monthlyData.map(data => data.spent || 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Budget",
        data: budgetData,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Spent",
        data: spentData,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Monthly Spending vs Budget" },
    },
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  )
}
