import { redirect } from "next/navigation"
import { getCurrentUser, getBudgetsForUser } from "@/app/actions"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import BudgetsList from "@/components/budgets-list"
import BudgetForm from "@/components/budget-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function BudgetsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const budgets = await getBudgetsForUser(user.id)

  // Convert Buffer to string for userId
  const formattedBudgets = budgets.map(budget => ({
    ...budget,
    userId: budget.userId.toString(), // Convert Buffer to string
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground">Create and manage your budgets</p>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">Budgets List</TabsTrigger>
              <TabsTrigger value="add">Create Budget</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>All Budgets</CardTitle>
                  <CardDescription>View and manage your budget categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetsList budgets={formattedBudgets} userId={user.id.toString()} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Budget</CardTitle>
                  <CardDescription>Set up a new budget category with monthly limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetForm userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

