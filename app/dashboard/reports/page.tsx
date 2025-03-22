import type { Metadata } from "next"
import BudgetSummary from "@/components/budget-summary"
import { SpendingByCategory } from "@/components/spending-by-category"
import MonthlySpending from "@/components/monthly-spending"
import { DateRangePicker } from "@/components/date-range-picker"
import { getCurrentUser, getReportsForUser } from "@/app/actions"
import { redirect } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Reports | Budget Tracker",
  description: "View your budget reports and analytics",
}

interface Report {
  expenses: { category: string; amount: number }[]
}

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
    return null
  }

  let reports: Report = { expenses: [] }

  try {
    const fetchedReports = await getReportsForUser(user.id)
    if (fetchedReports) {
      reports = fetchedReports
    }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return (
      <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Error Fetching Reports</AlertTitle>
        <AlertDescription>
          There was an error fetching your reports. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      {/* Header & Date Picker */}
      <div className="mb-6 md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Budget Reports</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Analyze your spending habits, track your expenses, and gain insights to improve your financial management.
        </p>
        <div className="mt-4 flex justify-center md:justify-start">
          <DateRangePicker className="w-full max-w-sm" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6">
        {/* Budget Summary (Full width) */}
        <div className="w-full">
          <BudgetSummary userId={user.id} />
        </div>

        {/* Reports Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {/* Spending by Category */}
          <div className="bg-card rounded-lg border shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Spending by Category</h2>
            <SpendingByCategory
              categories={reports.expenses.map(expense => ({
                name: expense.category,
                spent: expense.amount,
                color: "#007bff",
              }))}
            />
          </div>

          {/* Monthly Spending */}
          <div className="bg-card rounded-lg border shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Monthly Spending</h2>
            <MonthlySpending userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
