"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { deleteBudget } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import type { Budget } from "@/lib/db"

interface BudgetsListProps {
  budgets: Budget[]
  userId: string
}

const ITEMS_PER_PAGE = 5

export default function BudgetsList({ budgets, userId }: BudgetsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteBudget(userId, id)
      toast({
        title: "Budget deleted",
        description: "The budget has been deleted successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting budget:", error)
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter budgets based on search term
  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.period.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE)
  const paginatedBudgets = filteredBudgets.slice(
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search budgets..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
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
      </div>

      {/* No budgets message */}
      {filteredBudgets.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          {budgets.length === 0
            ? "No budgets found. Create your first budget to get started."
            : "No budgets match your search."}
        </div>
      ) : (
        <div className="rounded-md border">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                {paginatedBudgets.map((budget) => (
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

          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4 p-2">
            {paginatedBudgets.map((budget) => (
              <div
                key={budget._id?.toString()}
                className="rounded-lg border p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-lg font-bold">${budget.amount.toFixed(2)}</p>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
