"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addBudget } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

const categories = [
  "Food",
  "Transportation",
  "Housing",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
]

const periods = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "yearly", label: "Yearly" },
]

interface BudgetFormProps {
  userId: string
}

export default function BudgetForm({ userId }: BudgetFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly",
  })

  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addBudget(userId, {
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        period: formData.period as "monthly" | "weekly" | "yearly",
      })

      // Show success toast
      toast({
        title: "Budget created",
        description: "Your budget has been created successfully.",
        variant: "success",
      })

      // Reset form
      setFormData({
        category: "",
        amount: "",
        period: "monthly",
      })

      // Refresh the page to show the new budget
      router.refresh()
    } catch (error) {
      console.error("Error adding budget:", error)

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Budget Amount ($)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select value={formData.period} onValueChange={(value) => handleSelectChange("period", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Budget..." : "Create Budget"}
      </Button>
    </form>
  )
}

