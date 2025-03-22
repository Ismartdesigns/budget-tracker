"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { MoreHorizontal, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { deleteExpense } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import type { Expense } from "@/lib/db"

interface ExpensesListProps {
  expenses: Expense[]
  userId: string
}

const ITEMS_PER_PAGE = 5

export default function ExpensesList({ expenses, userId }: ExpensesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteExpense(id)
      toast({
        title: "Expense deleted",
        description: "The expense has been deleted successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-4">
      {/* Top Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {paginatedExpenses.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          {expenses.length === 0
            ? "No expenses found. Add your first expense to get started."
            : "No expenses match your search."}
        </div>
      ) : (
        <div className="rounded-md border">
          {/* Responsive Table for Larger Screens */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.map((expense) => (
                  <TableRow key={String(expense._id)}>
                    <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={isDeleting === expense._id}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => expense?._id ? handleDelete(expense._id.toString()) : null}
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

          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4 p-2">
            {paginatedExpenses.map((expense) => (
              <div
                key={String(expense._id)}
                className="rounded-lg border p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{expense.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-gray-100">
                    {expense.category}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={isDeleting === expense._id}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => expense?._id ? handleDelete(expense._id.toString()) : null}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
