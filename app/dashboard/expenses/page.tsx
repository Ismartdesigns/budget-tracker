import { redirect } from "next/navigation"
import { getCurrentUser, getExpensesForUser } from "@/app/actions"
import ExpensesList from "@/components/expenses-list"
import ExpenseForm from "@/components/expense-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ExpensesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
    return null
  }

  const expenses = await getExpensesForUser(user.id)

  // Convert Buffer to string for _id
  const formattedExpenses = expenses.map(expense => ({
    ...expense,
    _id: expense._id?.toString() || '', // Convert Buffer to string and handle undefined
  }))

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your expenses</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Expenses List</TabsTrigger>
          <TabsTrigger value="add">Add Expense</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>View and manage all your recorded expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesList expenses={formattedExpenses} userId={user.id.toString()} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>Record a new expense to track your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
