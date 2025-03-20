"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { deleteBudget } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import type { Budget } from "@/lib/db"

interface BudgetsListProps {
  budgets: Budget[]
  userId: string
}

export default function BudgetsList({ budgets, userId }: BudgetsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteBudget(userId, id)
      // Show success toast
      toast({
        title: "Budget deleted",
        description: "The budget has been deleted successfully.",
        variant: "success",
      })
      // The page will be refreshed by the server action
    } catch (error) {
      console.error("Error deleting budget:", error)
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div>
      {budgets.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No budgets found. Create your first budget to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget._id?.toString()}>
                  <TableCell className="font-medium">{budget.category}</TableCell>
                  <TableCell className="capitalize">{budget.period}</TableCell>
                  <TableCell className="text-right">${budget.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={isDeleting === budget._id?.toString()}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(budget._id?.toString() || "")}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

