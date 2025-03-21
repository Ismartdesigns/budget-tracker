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

// Define a proper type for reports
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
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Budget Reports</h1>
        <p className="text-muted-foreground">
          Analyze your spending habits, track your expenses, and gain insights to improve your financial management.
        </p>
        <div className="mt-4">
          <DateRangePicker className="date-range-picker" />
        </div>
      </div>

      <div className="grid gap-6">
        <BudgetSummary userId={user.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-lg border shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
            <SpendingByCategory
              categories={reports.expenses.map(expense => ({
                name: expense.category,
                spent: expense.amount,
                color: "#007bff",
              }))}
            />
          </div>

          <div className="bg-card rounded-lg border shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
            <MonthlySpending userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
