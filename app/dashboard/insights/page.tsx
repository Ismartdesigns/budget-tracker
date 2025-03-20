import { redirect } from "next/navigation"
import { getCurrentUser, getFinancialDataForUser } from "@/app/actions"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AiInsightsFull from "@/components/ai-insights-full"
import SpendingTrends from "@/components/spending-trends"
import SavingRecommendations from "@/components/saving-recommendations"

export default async function InsightsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const financialData = await getFinancialDataForUser(user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-muted-foreground">Get personalized financial insights and recommendations</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>AI Financial Analysis</CardTitle>
                <CardDescription>Personalized insights based on your spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <AiInsightsFull financialData={financialData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Visualize your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingTrends data={financialData.expenses} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saving Recommendations</CardTitle>
                <CardDescription>AI-powered suggestions to help you save money</CardDescription>
              </CardHeader>
              <CardContent>
                <SavingRecommendations data={financialData} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

