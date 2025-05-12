import { Suspense } from "react";
import DebtManagement from "./DebtManagement";
import { BarLoader } from "react-spinners";
import { CreateDebtDrawer } from "@/components/CreateDebt";
import { Button } from "@/components/ui/button";

export default function DebtPage() {
  return (
    <div>
      <div className="px-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-6xl font-bold tracking-tight gradient-title">
            Debt Management
          </h1>
        </div>
    
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
          <DebtManagement />
        </Suspense>
      </div>
    </div>
  );
}