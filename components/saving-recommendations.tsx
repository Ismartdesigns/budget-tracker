"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDownIcon, TrendingDown, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

type FinancialData = {
  expenses: any[];
  budgets: any[];
  totalSpent: number;
  totalBudget: number;
  categorySummary: Record<string, number>;
};

type SavingOpportunity = {
  category: string;
  amount: number;
  potentialSavings: number;
  percentage: number;
  reasoning: string;
};

interface SavingRecommendationsProps {
  data: FinancialData;
}

export default function SavingRecommendations({ data }: SavingRecommendationsProps) {
  const [opportunities, setOpportunities] = useState<SavingOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [aiAttempted, setAiAttempted] = useState<boolean>(false);

  // Enhanced basic opportunities generator with more intelligent analysis
  const generateBasicOpportunities = () => {
    setUsingFallback(true);
    const categories = Object.keys(data.categorySummary);
    const savingOpportunities: SavingOpportunity[] = [];

    // Skip analysis if no data
    if (categories.length === 0) {
      setOpportunities([]);
      return;
    }

    categories.forEach((category) => {
      const spent = data.categorySummary[category] || 0;
      const budget = data.budgets.find((b) => b.category === category);
      const budgetAmount = budget?.amount || 0;

      // Only process categories with actual spending
      if (spent <= 0) return;

      // Different analysis strategies based on available data
      if (budget) {
        // For categories with defined budgets
        if (spent > budgetAmount) {
          // Over budget scenario
          const potentialSavings = Math.min(spent - budgetAmount, spent * 0.25); // Cap at 25% to be realistic
          const percentage = (potentialSavings / spent) * 100;

          savingOpportunities.push({
            category,
            amount: spent,
            potentialSavings,
            percentage,
            reasoning: `You're over budget in this category by $${(spent - budgetAmount).toFixed(2)}.`,
          });
        } else if (spent > budgetAmount * 0.8) {
          // Near budget scenario
          const potentialSavings = spent * 0.1;
          const percentage = 10;

          savingOpportunities.push({
            category,
            amount: spent,
            potentialSavings,
            percentage,
            reasoning: "You're approaching your budget limit. A small reduction could help.",
          });
        }
      } else {
        // No budget scenario
        // Apply different savings rates based on category amount
        let savingsRate = 0.15; // Default 15%
        let reasoning = "No budget set. Consider reducing some discretionary spending.";
        
        // For high-value categories, suggest a more conservative savings target
        if (spent > 500) {
          savingsRate = 0.10;
          reasoning = "Large expense category. Even small percentage reductions can yield significant savings.";
        } else if (spent < 50) {
          savingsRate = 0.20;
          reasoning = "Small expense category. Consider if this is essential or could be reduced.";
        }
        
        const potentialSavings = spent * savingsRate;
        const percentage = savingsRate * 100;

        savingOpportunities.push({
          category,
          amount: spent,
          potentialSavings,
          percentage,
          reasoning,
        });
      }
    });

    // Find the highest spending categories with no budget
    const highSpendNobudget = categories
      .filter((category) => !data.budgets.some((b) => b.category === category))
      .map((category) => ({
        category,
        spent: data.categorySummary[category] || 0,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 2);

    // Add recommendation to set budgets for high-spend categories
    highSpendNobudget.forEach(({ category, spent }) => {
      if (spent > 100 && !savingOpportunities.some(o => o.category === category)) {
        savingOpportunities.push({
          category,
          amount: spent,
          potentialSavings: spent * 0.15,
          percentage: 15,
          reasoning: "High expense with no budget. Consider setting a budget to track and control spending.",
        });
      }
    });

    // Sort by highest potential savings and take top 3
    savingOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
    setOpportunities(savingOpportunities.slice(0, 3));
  };

  const generateSavingOpportunities = async () => {
    // Reset states
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    setAiAttempted(true);

    // If there's not enough data, use the fallback immediately
    if (Object.keys(data.categorySummary).length === 0) {
      setLoading(false);
      generateBasicOpportunities();
      return;
    }

    try {
      // Format financial data for the AI
      const promptData = {
        categories: Object.entries(data.categorySummary).map(([category, amount]) => ({
          category,
          spent: amount,
          budget: data.budgets.find((b) => b.category === category)?.amount || 0,
        })),
        totalSpent: data.totalSpent,
        totalBudget: data.totalBudget,
      };

      // Check if openai API key is likely available
      const likelyHasApiKey = typeof process !== 'undefined' && 
                              process.env && 
                              process.env.OPENAI_API_KEY && 
                              process.env.OPENAI_API_KEY.length > 10;
      
      // Skip AI attempt if key is likely missing
      if (!likelyHasApiKey) {
        throw new Error("OpenAI API key likely not configured");
      }

      // Create prompt for the AI
      const prompt = `
        Based on the following financial data, identify the top 3 categories where the user has the best opportunities to save money.
        
        Financial Summary:
        - Total Budget: $${promptData.totalBudget.toFixed(2)}
        - Total Spent: $${promptData.totalSpent.toFixed(2)}
        
        Category Spending:
        ${promptData.categories
          .map(
            (c) =>
              `- ${c.category}: Spent $${c.spent.toFixed(2)}${
                c.budget ? `, Budget $${c.budget.toFixed(2)}` : " (No budget set)"
              }`
          )
          .join("\n")}
        
        For each savings opportunity, provide:
        1. The category name
        2. Current spending amount
        3. Recommended amount to save (the potential savings)
        4. Percentage of current spending this represents
        5. Brief reasoning for why this is a good savings opportunity
        
        Respond in this JSON format:
        {
          "opportunities": [
            {
              "category": "Category name",
              "amount": 123.45,
              "potentialSavings": 40.00,
              "percentage": 15,
              "reasoning": "Brief explanation of why this is a good opportunity to save"
            }
          ]
        }
        
        Focus on the top 3 opportunities with the highest potential savings.
      `;

      // Try to call the AI with a timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("AI request timed out")), 10000);
      });

      // Call the AI to generate recommendations
      const aiResponsePromise = generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: prompt,
        temperature: 0.4,
        maxTokens: 1000,
      });

      // Race the AI request against the timeout
      // The "as" type assertion here is necessary because we know the result will be of AI response type
      // if timeoutPromise loses the race
      const aiResponse = await Promise.race([aiResponsePromise, timeoutPromise]);
      
      // Parse the JSON response
      try {
        // Now TypeScript knows aiResponse has a text property
        const parsedResponse = JSON.parse(aiResponse.text);
        
        if (parsedResponse.opportunities && Array.isArray(parsedResponse.opportunities) && parsedResponse.opportunities.length > 0) {
          setOpportunities(parsedResponse.opportunities.slice(0, 3));
        } else {
          throw new Error("AI response missing opportunities array");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        throw new Error("Failed to parse AI recommendations");
      }
    } catch (err) {
      console.error("Error generating AI savings recommendations:", err);
      setError("Using simplified savings analysis");
      // Fallback to basic analysis
      generateBasicOpportunities();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      generateSavingOpportunities();
    }
  }, [data]);

  return (
    <Card>
      <CardContent className="p-6">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p>Add more expenses and budgets to get saving recommendations</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <TrendingDown className="h-5 w-5 text-green-500" />
                <span>Saving Opportunities</span>
              </div>
              <div className="flex gap-2 items-center">
                {usingFallback && aiAttempted && (
                  <div className="flex items-center text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Basic analysis</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSavingOpportunities}
                  disabled={loading}
                  className="h-8"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{opportunity.category}</span>
                    <span className="text-sm flex items-center gap-1 text-green-600">
                      <ArrowDownIcon className="h-3 w-3" />${opportunity.potentialSavings.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={opportunity.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Reduce spending by {opportunity.percentage.toFixed(0)}% to save $
                    {opportunity.potentialSavings.toFixed(2)}
                  </p>
                  {opportunity.reasoning && (
                    <p className="text-xs italic">{opportunity.reasoning}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-sm text-center text-muted-foreground pt-2">
              Total potential monthly savings: $
              {opportunities.reduce((sum, o) => sum + o.potentialSavings, 0).toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}