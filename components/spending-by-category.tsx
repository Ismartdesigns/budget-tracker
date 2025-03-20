"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface CategoryData {
  name: string
  spent: number
  color: string
}

interface SpendingByCategoryProps {
  categories?: CategoryData[]
}

export function SpendingByCategory({ categories = [] }: SpendingByCategoryProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Function to generate random colors
  const generateRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16)
    return `#${randomColor}`
  }

  useEffect(() => {
    if (!chartRef.current || categories.length === 0) return

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
      const categoryNames = categories.map(cat => cat.name)
      const categorySpent = categories.map(cat => cat.spent)
      const categoryColors = categories.map(() => generateRandomColor()) // Generate random colors for each category

        chartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
          labels: categoryNames,
            datasets: [
              {
              data: categorySpent,
              backgroundColor: categoryColors,
              borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  boxWidth: 12,
                },
              },
              tooltip: {
                callbacks: {
                label: context => {
                    const label = context.label || ""
                    const value = context.raw as number
                  const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
                  const percentage = total ? Math.round((value / total) * 100) : 0
                    return `${label}: $${value} (${percentage}%)`
                },
                },
              },
            },
          },
        })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [categories])

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow">
      {categories.length > 0 ? <canvas ref={chartRef} /> : <p className="text-center text-gray-500">No data available</p>}
    </div>
  )
}
