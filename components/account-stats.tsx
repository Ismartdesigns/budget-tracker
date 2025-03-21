"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getFinancialData, getUserProfile } from "@/app/actions";
import { CalendarDays, CreditCard, LineChart, Clock } from "lucide-react";
import { Expense } from "@/lib/db"; 

interface AccountStatsProps {
  userId: string;
}

// Define the user profile interface based on the actual data structure
interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
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

        // Calculate account age based on first transaction date if available
        // This is an alternative approach since we don't have createdAt
        let accountAge = 0;
        if (totalTransactions > 0) {
          const dates = financialData.expenses.map((expense: Expense) => new Date(expense.date));
          const oldestTransaction = new Date(Math.min(...dates.map((date: Date) => date.getTime())));
          const today = new Date();
          accountAge = Math.floor((today.getTime() - oldestTransaction.getTime()) / (1000 * 60 * 60 * 24));
        }

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

  // Format account age to be more user-friendly
  const formatAccountAge = (days: number) => {
    if (days === 0) return "New account";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  };

  // Calculate the estimated creation date based on the account age
  const estimatedCreationDate = stats.accountAge > 0 
    ? new Date(Date.now() - stats.accountAge * 24 * 60 * 60 * 1000).toLocaleDateString()
    : "Today";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">Total Transactions</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalTransactions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">Account Age</span>
          </div>
          <div className="text-2xl font-bold">{formatAccountAge(stats.accountAge)}</div>
          {stats.accountAge > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              First activity: {estimatedCreationDate}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">Last Activity</span>
          </div>
          <div className="text-2xl font-bold">{stats.lastActivity}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-2">
            <LineChart className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">Categories Used</span>
          </div>
          <div className="text-2xl font-bold">{stats.categoriesUsed}</div>
        </CardContent>
      </Card>
    </div>
  );
}