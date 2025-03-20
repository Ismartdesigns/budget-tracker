"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getFinancialData, getUserProfile } from "@/app/actions";
import { CalendarDays, CreditCard, LineChart, Clock } from "lucide-react";
import { Expense } from "@/lib/db"; 

interface AccountStatsProps {
  userId: string;
}

export default function AccountStats({ userId }: AccountStatsProps) {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    accountAge: 0,
    lastActivity: "",
    categoriesUsed: 0,
    name: "",
    email: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [financialData, userProfile] = await Promise.all([
          getFinancialData(userId),
          getUserProfile(userId),
        ]);

        // Calculate statistics
        const totalTransactions = financialData.expenses.length;

        // Get unique categories
        const uniqueCategories = new Set(
          financialData.expenses.map((expense: Expense) => expense.category)
        );

        // Get last activity date
        let lastActivity = "Never";
        if (totalTransactions > 0) {
          const dates = financialData.expenses.map((expense: Expense) => new Date(expense.date));
          lastActivity = new Date(Math.max(...dates.map((date: Date) => date.getTime()))).toLocaleDateString();
        }

        // Mock account age (replace with actual user creation date)
        const accountAge = 30; // Replace this with actual logic

        setStats({
          totalTransactions,
          accountAge,
          lastActivity,
          categoriesUsed: uniqueCategories.size,
          name: userProfile.name,
          email: userProfile.email,
          bio: userProfile.bio || "",
        });
      } catch (error) {
        console.error("Error fetching account stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Total Transactions</span>
          <div className="mt-2 text-2xl font-bold">{stats.totalTransactions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Account Age</span>
          <div className="mt-2 text-2xl font-bold">{stats.accountAge} days</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Last Activity</span>
          <div className="mt-2 text-2xl font-bold">{stats.lastActivity}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <LineChart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Categories Used</span>
          <div className="mt-2 text-2xl font-bold">{stats.categoriesUsed}</div>
        </CardContent>
      </Card>
    </div>
  );
}