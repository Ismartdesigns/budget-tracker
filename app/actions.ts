"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  findUserByEmail,
  findUserById,
  createUser,
  getExpenses,
  createExpense,
  deleteExpenseById,
  getBudgets,
  createOrUpdateBudget,
  deleteBudgetById,
  getFinancialData as getFinancialDataFromDb,
  updateUser,
  type Expense,
  type Budget,
  type FinancialData,
  type User,
} from "@/lib/db";

// Authentication functions
export async function loginUser(email: string, password: string) {
  try {
    const user = await findUserByEmail(email);

    if (!user || user.password !== password) {
      return { success: false, error: "Invalid email or password" };
    }

    const cookieStore = await cookies();
    cookieStore.set("userId", user._id!.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function signupUser(name: string, email: string, password: string) {
  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const newUser = await createUser({ name, email, password });

    const cookieStore = await cookies();
    cookieStore.set("userId", newUser._id!.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      success: true,
      user: {
        id: newUser._id!.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An error occurred during signup" };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  return { success: true };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return null;
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Add getUserProfile function
export async function getUserProfile(userId: string) {
  try {
    const user = await findUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || "",
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: { name?: string; email?: string; password?: string; bio?: string }
) {
  try {
    // Verify the user exists
    const existingUser = await findUserById(userId);
    
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }
    
    // Check if email is being updated and is not already in use
    if (profileData.email && profileData.email !== existingUser.email) {
      const userWithEmail = await findUserByEmail(profileData.email);
      if (userWithEmail && userWithEmail._id!.toString() !== userId) {
        return { success: false, error: "Email already in use" };
      }
    }
    
    // Update the user in the database
    const updatedUser = await updateUser(userId, profileData);
    
    if (!updatedUser) {
      return { success: false, error: "Failed to update profile" };
    }
    
    // Revalidate paths that might display user information
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    
    return {
      success: true,
      user: {
        id: updatedUser._id!.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio || "",
      },
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "An error occurred while updating profile" };
  }
}

// Export getFinancialData
export async function getFinancialData(userId: string): Promise<FinancialData> {
  return getFinancialDataFromDb(userId);
}

export async function getFinancialDataForUser(userId: string): Promise<FinancialData> {
  const expenses = await getExpenses(userId);
  const budgets = await getBudgets(userId);

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  // Calculate category summary
  const categorySummary: Record<string, number> = {};
  for (const expense of expenses) {
    if (!categorySummary[expense.category]) {
      categorySummary[expense.category] = 0;
    }
    categorySummary[expense.category] += expense.amount;
  }

  return {
    expenses,
    budgets,
    totalSpent,
    totalBudget,
    categorySummary,
  };
}

export async function getExpensesForUser(userId: string) {
  try {
    const expenses = await getExpenses(userId);

    // Convert Buffer to string for _id
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      _id: expense._id ? expense._id.toString() : '', // Convert Buffer to string and handle undefined
    }));

    return formattedExpenses;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw new Error("Failed to fetch expenses");
  }
}

export async function getBudgetsForUser(userId: string) {
  try {
    return await getBudgets(userId);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw new Error("Failed to fetch budgets");
  }
}

export async function addBudget(userId: string, budgetData: { category: string; amount: number; period: "monthly" | "weekly" | "yearly" }) {
  try {
    return await createOrUpdateBudget({ userId, ...budgetData });
  } catch (error) {
    console.error("Error adding budget:", error);
    throw new Error("Failed to add budget");
  }
}

export async function generateAiInsights(financialData: FinancialData) {
  const insights = [];
  const recommendations = [];

  // Check if the user is over budget
  if (financialData.totalSpent > financialData.totalBudget) {
    insights.push({
      title: "Over Budget",
      description: "You have exceeded your budget this month. Consider reviewing your spending habits.",
    });
    recommendations.push({
      title: "Review Your Budget",
      description: "Adjust your budget categories to better reflect your spending patterns.",
    });
  }

  // Check if there are recorded expenses
  if (financialData.expenses.length > 0) {
    insights.push({
      title: "Expense Tracking",
      description: "You have recorded expenses this month. Keep tracking to stay on top of your finances.",
    });
    recommendations.push({
      title: "Track Your Spending",
      description: "Regularly review your expenses to identify areas for potential savings.",
    });
  }

  // Analyze spending by category
  if (financialData.categorySummary) {
    for (const [category, amount] of Object.entries(financialData.categorySummary)) {
      if (amount > 1000) { // Example threshold for high spending
        insights.push({
          title: `High Spending in ${category}`,
          description: `You have spent a significant amount in ${category}. Consider reducing expenses in this area.`,
        });
        recommendations.push({
          title: `Limit ${category} Spending`,
          description: `Try to limit your spending in ${category} to stay within your budget.`,
        });
      }
    }
  }

  return {
    insights,
    recommendations,
  };
}

export async function addExpense(userId: string, expenseData: { amount: number; category: string; description: string; date: string }) {
  try {
    return await createExpense({ userId, ...expenseData, id: '' }); // Assuming an empty string is an acceptable default for 'id'
  } catch (error) {
    console.error("Error adding expense:", error);
    throw new Error("Failed to add expense");
  }
}

// Fetch reports data
export async function getReportsForUser(userId: string) {
  try {
    const expenses = await getExpenses(userId);
    const budgets = await getBudgets(userId);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

    return {
      totalSpent,
      totalBudget,
      expenses,
      budgets,
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }
}

// Fetch categories data
export async function getCategoriesForUser(userId: string) {
  try {
    const budgets = await getBudgets(userId);
    const expenses = await getExpenses(userId);

    const categorySummary: Record<string, { budget: number; spent: number }> = {};

    budgets.forEach(budget => {
      categorySummary[budget.category] = {
        budget: budget.amount,
        spent: 0,
      };
    });

    expenses.forEach(expense => {
      if (categorySummary[expense.category]) {
        categorySummary[expense.category].spent += expense.amount;
      }
    });

    return categorySummary;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getMonthlyFinancialDataForUser(userId: string) {
  try {
    const expenses = await getExpenses(userId);
    const budgets = await getBudgets(userId);

    const monthlyData: Record<string, { budget: number; spent: number }> = {};

    budgets.forEach(budget => {
      const month = new Date().toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { budget: 0, spent: 0 };
      }
      monthlyData[month].budget += budget.amount;
    });

    expenses.forEach(expense => {
      const month = expense.date.slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { budget: 0, spent: 0 };
      }
      monthlyData[month].spent += expense.amount;
    });

    return Object.keys(monthlyData)
      .sort()
      .map(month => ({
        month,
        budget: monthlyData[month].budget,
        spent: monthlyData[month].spent,
      }));
  } catch (error) {
    console.error("Error fetching monthly financial data:", error);
    throw new Error("Failed to fetch monthly financial data");
  }
}

// Function to delete an expense
export async function deleteExpense(expenseId: string) {
  try {
    const deletedExpense = await deleteExpenseById(expenseId);

    if (!deletedExpense) {
      throw new Error("Expense not found or unauthorized");
    }

    revalidatePath("/dashboard");

    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}