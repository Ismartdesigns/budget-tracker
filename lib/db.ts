import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

// Types
export type User = {
  _id?: string | ObjectId
  name: string
  email: string
  bio?: string
  password: string // Note: In a real app, this should be hashed
  createdAt?: Date
}

export type Expense = {
  id: string
  _id?: string | ObjectId
  userId: string | ObjectId
  amount: number
  category: string
  description: string
  date: string
  createdAt?: Date
}

export type Budget = {
  _id?: string | ObjectId
  userId: string | ObjectId
  category: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  createdAt?: Date
}

export type FinancialData = {
  expenses: Expense[]
  budgets: Budget[]
  totalSpent: number
  totalBudget: number
  categorySummary: Record<string, number>
}

// Database functions
export async function getDb() {
  try {
    const client = await clientPromise
    return client.db("budget-tracker")
  } catch (error) {
    console.error("Failed to connect to the database:", error)
    throw new Error("Database connection error")
  }
}

// User functions
export async function findUserByEmail(email: string) {
  const db = await getDb();
  try {
    const user = await db.collection("users").findOne({ email });
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Failed to find user");
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb()
  const objectId = new ObjectId(id)
  return db.collection("users").findOne({ _id: objectId }) as Promise<User | null>
}

export async function createUser(userData: Omit<User, "_id" | "createdAt">): Promise<User> {
  const db = await getDb()
  const result = await db.collection("users").insertOne({
    ...userData,
    createdAt: new Date(),
  })

  return {
    _id: result.insertedId,
    ...userData,
    createdAt: new Date(),
  }
}

// Add the missing updateUser function
export async function updateUser(
  userId: string, 
  updateData: Partial<Omit<User, "_id" | "createdAt">>
): Promise<User | null> {
  const db = await getDb();
  const objectId = new ObjectId(userId);
  
  try {
    // Create an object with only the fields that need to be updated
    const updateFields: Record<string, any> = {};
    
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.password !== undefined) updateFields.password = updateData.password;
    if (updateData.bio !== undefined) updateFields.bio = updateData.bio;
    
    // Only update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      const user = await findUserById(userId);
      return user;
    }
    
    // Update the user document
    await db.collection("users").updateOne(
      { _id: objectId },
      { $set: updateFields }
    );
    
    // Return the updated user
    const updatedUser = await findUserById(userId);
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

// Expense functions
export async function getExpenses(userId: string): Promise<Expense[]> {
  const db = await getDb()
  const objectId = new ObjectId(userId)
  return db.collection("expenses").find({ userId: objectId }).sort({ date: -1 }).toArray() as Promise<Expense[]>
}

export async function createExpense(expenseData: Omit<Expense, "_id" | "createdAt">): Promise<Expense> {
  const db = await getDb()
  try {
    const result = await db.collection("expenses").insertOne({
      ...expenseData,
      userId: new ObjectId(expenseData.userId as string),
      createdAt: new Date(),
    })

    return {
      _id: result.insertedId,
      ...expenseData,
      createdAt: new Date(),
    }
  } catch (error) {
    console.error("Failed to create expense:", error)
    throw new Error("Failed to create expense")
  }
}

export async function deleteExpenseById(id: string): Promise<boolean> {
  const db = await getDb()
  const objectId = new ObjectId(id)
  const result = await db.collection("expenses").deleteOne({ _id: objectId })
  return result.deletedCount === 1
}

// Budget functions
export async function getBudgets(userId: string): Promise<Budget[]> {
  const db = await getDb()
  const objectId = new ObjectId(userId)
  return db.collection("budgets").find({ userId: objectId }).toArray() as Promise<Budget[]>
}

export async function findBudgetByCategory(userId: string, category: string): Promise<Budget | null> {
  const db = await getDb()
  const objectId = new ObjectId(userId)
  return db.collection("budgets").findOne({
    userId: objectId,
    category,
  }) as Promise<Budget | null>
}

export async function createOrUpdateBudget(budgetData: Omit<Budget, "_id" | "createdAt">): Promise<Budget> {
  const db = await getDb()
  const objectId = new ObjectId(budgetData.userId as string)

  // Check if budget for this category already exists
  const existingBudget = await findBudgetByCategory(budgetData.userId as string, budgetData.category)

  if (existingBudget) {
    // Update existing budget
    await db.collection("budgets").updateOne(
      { _id: new ObjectId(existingBudget._id as string) },
      {
        $set: {
          amount: budgetData.amount,
          period: budgetData.period,
        },
      },
    )

    return {
      ...existingBudget,
      amount: budgetData.amount,
      period: budgetData.period,
    }
  } else {
    // Create new budget
    const result = await db.collection("budgets").insertOne({
      ...budgetData,
      userId: objectId,
      createdAt: new Date(),
    })

    return {
      _id: result.insertedId,
      ...budgetData,
      createdAt: new Date(),
    }
  }
}

export async function deleteBudgetById(id: string): Promise<boolean> {
  const db = await getDb()
  const objectId = new ObjectId(id)
  const result = await db.collection("budgets").deleteOne({ _id: objectId })
  return result.deletedCount === 1
}

// Financial data functions
export async function getFinancialData(userId: string): Promise<FinancialData> {
  const expenses = await getExpenses(userId)
  const budgets = await getBudgets(userId)

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

  // Calculate category summary
  const categorySummary: Record<string, number> = {}

  for (const expense of expenses) {
    if (!categorySummary[expense.category]) {
      categorySummary[expense.category] = 0
    }
    categorySummary[expense.category] += expense.amount
  }

  return {
    expenses,
    budgets,
    totalSpent,
    totalBudget,
    categorySummary,
  }
}