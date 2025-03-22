"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDownIcon, TrendingDown, RefreshCw } from "lucide-react";
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

  const generateSavingOpportunities = async () => {
    // If there's not enough data, don't try to generate recommendations
    if (Object.keys(data.categorySummary).length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

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

      // Call the AI to generate recommendations
      const aiResponse = await generateText({
        model: openai("gpt-3.5-turbo"),  // Changed to the free gpt-3.5-turbo model
        prompt: prompt,
        temperature: 0.4,
        maxTokens: 1000,
      });

      // Parse the JSON response
      const parsedResponse = JSON.parse(aiResponse.text);
      
      if (parsedResponse.opportunities && Array.isArray(parsedResponse.opportunities)) {
        setOpportunities(parsedResponse.opportunities.slice(0, 3));
      } else {
        // Fallback to basic analysis if AI response doesn't match expected format
        generateBasicOpportunities();
      }
    } catch (err) {
      console.error("Error generating AI savings recommendations:", err);
      setError("Failed to generate AI recommendations");
      // Fallback to basic analysis
      generateBasicOpportunities();
    } finally {
      setLoading(false);
    }
  };

  // Fallback method if AI fails
  const generateBasicOpportunities = () => {
    const categories = Object.keys(data.categorySummary);
    const savingOpportunities: SavingOpportunity[] = [];

    categories.forEach((category) => {
      const spent = data.categorySummary[category] || 0;
      const budget = data.budgets.find((b) => b.category === category);

      if (budget && spent > 0) {
        if (spent > budget.amount) {
          const potentialSavings = spent - budget.amount;
          const percentage = (potentialSavings / spent) * 100;

          savingOpportunities.push({
            category,
            amount: spent,
            potentialSavings,
            percentage,
            reasoning: `You're over budget in this category by $${potentialSavings.toFixed(2)}.`,
          });
        } else if (spent > budget.amount * 0.8) {
          const potentialSavings = spent * 0.1;
          const percentage = 10;

          savingOpportunities.push({
            category,
            amount: spent,
            potentialSavings,
            percentage,
            reasoning: "You're near your budget limit. A small reduction could help.",
          });
        }
      } else if (spent > 0) {
        const potentialSavings = spent * 0.15;
        const percentage = 15;

        savingOpportunities.push({
          category,
          amount: spent,
          potentialSavings,
          percentage,
          reasoning: "No budget set. Consider reducing discretionary spending.",
        });
      }
    });

    // Sort by highest potential savings
    savingOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
    setOpportunities(savingOpportunities.slice(0, 3));
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