"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, TrendingUp, DollarSign } from "lucide-react"
import { generateAiInsights } from "@/app/actions"

type FinancialData = {
  expenses: any[]
  budgets: any[]
  totalSpent: number
  totalBudget: number
  categorySummary: Record<string, number>
}

type Insight = {
  title: string
  description: string
}

interface AiInsightsFullProps {
  financialData: FinancialData
}

const AiInsightsFull: React.FC<AiInsightsFullProps> = ({ financialData }) => {
  const [insights, setInsights] = useState<Insight[]>([])
  const [recommendations, setRecommendations] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      if (!financialData || Object.keys(financialData.categorySummary || {}).length === 0) {
        setLoading(false)
        // Set default insights for empty data
        setInsights([
          {
            title: "Welcome to AI Insights",
            description: "Add more transactions to get personalized financial recommendations.",
          }
        ])
        setRecommendations([
          {
            title: "Start Tracking",
            description: "Begin recording your expenses to receive tailored advice.",
          }
        ])
        return
      }
      
      try {
        const aiData = await generateAiInsights(financialData)
        setInsights(aiData.insights || [])
        setRecommendations(aiData.recommendations || [])
      } catch (error) {
        console.error("Error fetching AI insights:", error)
        // Provide fallback insights when there's an error
        setInsights([
          {
            title: "Welcome to AI Insights",
            description: "Add more transactions to get personalized financial recommendations.",
          }
        ])
        setRecommendations([
          {
            title: "Regular Tracking",
            description: "Track your expenses consistently to improve your financial awareness.",
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [financialData])

  return (
    <Tabs defaultValue="insights">
      <TabsList className="mb-4">
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
      </TabsList>
      <TabsContent value="insights">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-2">
                  <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Add more transactions to get personalized insights.
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {index % 2 === 0 ? (
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    )}
                    {insight.title}
                  </h3>
                  <p className="text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="recommendations">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-2">
                  <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Add more transactions to get personalized recommendations.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    {recommendation.title}
                  </h3>
                  <p className="text-muted-foreground">{recommendation.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

export default AiInsightsFull