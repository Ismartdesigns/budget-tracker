"use client";

import { useEffect, useState } from "react";
import { getReportsForUser } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface ReportsProps {
  userId: string;
}

export default function Reports({ userId }: ReportsProps) {
  const [reports, setReports] = useState({ totalSpent: 0, totalBudget: 0 });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getReportsForUser(userId);
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: "Failed to fetch reports. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchReports();
  }, [userId]);

  return (
    <div>
      <h2>Reports</h2>
      <p>Total Spent: ${reports.totalSpent}</p>
      <p>Total Budget: ${reports.totalBudget}</p>
    </div>
  );
} 