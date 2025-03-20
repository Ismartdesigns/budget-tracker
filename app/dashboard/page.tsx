import { redirect } from "next/navigation"
import { getCurrentUser, getFinancialDataForUser } from "@/app/actions"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import FinancialOverview from "@/components/financial-overview"
import RecentTransactions from "@/components/recent-transactions"
import BudgetSummary from "@/components/budget-summary"
import AiInsights from "@/components/ai-insights"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get financial data for the user
  const financialData = await getFinancialDataForUser(user.id)

  // Check if OpenAI API key is configured
  const hasOpenAiKey = !!process.env.OPENAI_API_KEY
  // Check if MongoDB is configured
  const hasMongoDb = !!process.env.MONGODB_URI

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8">
          {!hasMongoDb && (
            <Alert className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>MongoDB Not Configured</AlertTitle>
              <AlertDescription>
                MongoDB connection string is not configured. Data will not be persisted. Please set the MONGODB_URI
                environment variable.
              </AlertDescription>
            </Alert>
          )}

          {!hasOpenAiKey && (
            <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>AI Features Limited</AlertTitle>
              <AlertDescription>
                OpenAI API key is not configured. AI insights are using fallback data. For full AI functionality, please
                set the OPENAI_API_KEY environment variable.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FinancialOverview userId={user.id} />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-1 md:col-span-1 lg:col-span-4">
              <RecentTransactions userId={user.id} />
            </div>
            <div className="col-span-1 md:col-span-1 lg:col-span-3">
              <div className="grid gap-6">
                <BudgetSummary userId={user.id} />
                <AiInsights userId={user.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

