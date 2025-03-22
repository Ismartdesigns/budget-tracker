"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { format, subDays } from "date-fns"

interface Expense {
  date: string | Date
  amount: number
}

interface SpendingTrendsProps {
  data: Expense[]
}

export default function SpendingTrends({ data }: SpendingTrendsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Prepare data for the chart
    const today = new Date()
    const days = 30 // Show last 30 days
    const dailySpending: { date: Date; amount: number }[] = []

    // Initialize array with zeros for the last 30 days
    for (let i = 0; i < days; i++) {
      dailySpending.push({
        date: subDays(today, days - i - 1),
        amount: 0,
      })
    }

    // Aggregate expenses by day
    data.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const dayIndex = dailySpending.findIndex(
        (day) => format(day.date, "yyyy-MM-dd") === format(expenseDate, "yyyy-MM-dd"),
      )
      if (dayIndex >= 0) {
        dailySpending[dayIndex].amount += expense.amount
      }
    })

    // Draw the chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Find max amount for scaling
    const maxAmount = Math.max(...dailySpending.map((day) => day.amount), 100)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Draw y-axis labels
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (i * chartHeight) / 5
      const amount = (i * maxAmount) / 5
      ctx.fillText(`$${amount.toFixed(0)}`, padding - 10, y)

      // Draw horizontal grid lines
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = "#e2e8f0"
      ctx.stroke()
    }

    // Draw x-axis labels (every 5 days)
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    for (let i = 0; i < dailySpending.length; i += 5) {
      const x = padding + (i * chartWidth) / (days - 1)
      ctx.fillText(format(dailySpending[i].date, "MMM d"), x, height - padding + 10)
    }

    // Draw the line chart
    ctx.beginPath()
    dailySpending.forEach((day, i) => {
      const x = padding + (i * chartWidth) / (days - 1)
      const y = height - padding - (day.amount / maxAmount) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()

    // Add gradient fill under the line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)")
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

    ctx.beginPath()
    dailySpending.forEach((day, i) => {
      const x = padding + (i * chartWidth) / (days - 1)
      const y = height - padding - (day.amount / maxAmount) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(padding + chartWidth, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw data points
    dailySpending.forEach((day, i) => {
      const x = padding + (i * chartWidth) / (days - 1)
      const y = height - padding - (day.amount / maxAmount) * chartHeight
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }, [data])

  return (
    <Card>
      <CardContent className="p-6">
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Add expenses to see your spending trends
          </div>
        ) : (
          <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto"></canvas>
        )}
      </CardContent>
    </Card>
  )
}