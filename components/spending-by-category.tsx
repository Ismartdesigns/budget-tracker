"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { Loader } from "lucide-react"

Chart.register(...registerables)

interface CategoryData {
  name: string
  spent: number
  color?: string
}

interface SpendingByCategoryProps {
  categories?: CategoryData[]
  isLoading?: boolean
}

export function SpendingByCategory({ categories = [], isLoading = false }: SpendingByCategoryProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Function to generate distinct colors
  const generateDistinctColors = (count: number) => {
    const colors: string[] = []
    
    // Predefined color palette for better visual distinction
    const colorPalette = [
      "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
      "#FF9F40", "#8AC926", "#1982C4", "#6A4C93", "#F94144",
      "#F3722C", "#F8961E", "#F9C74F", "#90BE6D", "#43AA8B"
    ]
    
    // Use predefined colors first
    for (let i = 0; i < count; i++) {
      if (i < colorPalette.length) {
        colors.push(colorPalette[i])
      } else {
        // Generate random colors if we need more than the palette provides
        const hue = (i * 137.5) % 360 // Use golden angle approximation for better distribution
        colors.push(`hsl(${hue}, 70%, 60%)`)
      }
    }
    
    return colors
  }

  useEffect(() => {
    if (!chartRef.current || categories.length === 0 || isLoading) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Merge categories with the same name
    const mergedCategories = categories.reduce<Record<string, CategoryData>>((acc, category) => {
      const { name, spent } = category
      
      if (acc[name]) {
        // If category already exists, add the spent amount
        acc[name].spent += spent
      } else {
        // Only store name and spent; we'll assign colors later
        acc[name] = {
          name,
          spent
        }
      }
      
      return acc
    }, {})

    // Convert the merged categories object back to an array
    const processedCategories = Object.values(mergedCategories)
    
    // Generate distinct colors for each category
    const distinctColors = generateDistinctColors(processedCategories.length)
    
    // Assign colors to categories
    processedCategories.forEach((category, index) => {
      category.color = distinctColors[index]
    })
    
    const ctx = chartRef.current.getContext("2d")

    if (ctx) {
      const categoryNames = processedCategories.map(cat => cat.name)
      const categorySpent = processedCategories.map(cat => cat.spent)
      const categoryColors = processedCategories.map(cat => cat.color as string)
      
      // Calculate total spent for percentage calculations
      const totalSpent = categorySpent.reduce((sum, amount) => sum + amount, 0)

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
                  const percentage = totalSpent ? Math.round((value / totalSpent) * 100) : 0
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
  }, [categories, isLoading])

  if (isLoading) {
    return (
      <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <Loader className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow">
      {categories.length > 0 ? <canvas ref={chartRef} /> : <p className="text-center text-gray-500">No data available</p>}
    </div>
  )
}
