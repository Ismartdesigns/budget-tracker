"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"
import { getFinancialDataForUser, generateAiInsights } from "@/app/actions"

type Insight = {
  title: string
  description: string
}

interface AiInsightsProps {
  userId: string
}

export default function AiInsights({ userId }: AiInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const financialData = await getFinancialDataForUser(userId)
        const aiData = await generateAiInsights(financialData)
        setInsights(aiData.insights.slice(0, 2)) // Show only 2 insights in the summary
      } catch (error) {
        console.error("Error fetching AI insights:", error)
        // Provide fallback insights when there's an error
        setInsights([
          {
            title: "Welcome to AI Insights",
            description: "Add more transactions to get personalized financial recommendations.",
          },
          {
            title: "Track Your Spending",
            description: "Regular tracking of your expenses helps identify patterns and opportunities for saving.",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
        <CardDescription>Personalized financial recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Add more transactions to get personalized insights.
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

