"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the debt types enum
const DEBT_TYPES = [
  "MORTGAGE",
  "CREDIT_CARD",
  "STUDENT_LOAN",
  "CAR_LOAN",
  "PERSONAL_LOAN",
  "OTHER",
] as const;

// Create a proper Zod schema that matches the API expectations
const debtSchema = z.object({
  name: z.string().min(1, "Debt name is required"),
  type: z.enum(DEBT_TYPES, {
    required_error: "Please select a debt type",
  }),
  totalAmount: z.string().min(1, "Total amount is required"),
  remainingAmount: z.string().min(1, "Current balance is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  minimumPayment: z.string().min(1, "Monthly payment is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type DebtFormData = z.infer<typeof debtSchema>;

type DebtType = 'MORTGAGE' | 'CREDIT_CARD' | 'STUDENT_LOAN' | 'CAR_LOAN' | 'PERSONAL_LOAN' | 'OTHER';

export function CreateDebtDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { userId } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: "",
      type: "OTHER",
      totalAmount: "",
      remainingAmount: "",
      interestRate: "",
      minimumPayment: "",
      dueDate: "",
    },
  });

  const onSubmit = async (data: DebtFormData) => {
    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          totalAmount: parseFloat(data.totalAmount),
          remainingAmount: parseFloat(data.remainingAmount),
          interestRate: parseFloat(data.interestRate),
          minimumPayment: parseFloat(data.minimumPayment),
          dueDate: new Date(data.dueDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create debt");
      }

      const newDebt = await response.json();
      toast.success("Debt account added");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create debt");
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className="w-full">{children}</DrawerTrigger>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="px-4">
          <DrawerTitle className="text-lg font-semibold">Add New Debt</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Debt Name</label>
              <Input placeholder="e.g., Credit Card, Car Loan" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Debt Type</label>
              <Select onValueChange={(value: "MORTGAGE" | "CREDIT_CARD" | "STUDENT_LOAN" | "CAR_LOAN" | "PERSONAL_LOAN" | "OTHER") => setValue("type", value)} defaultValue="OTHER">
                <SelectTrigger>
                  <SelectValue placeholder="Select debt type" />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Total Amount</label>
              <Input 
                placeholder="Original loan amount" 
                type="number" 
                step="0.01" 
                {...register("totalAmount")} 
              />
              {errors.totalAmount && <p className="text-sm text-red-500">{errors.totalAmount.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Current Balance</label>
              <Input 
                placeholder="Amount you currently owe" 
                type="number" 
                step="0.01" 
                {...register("remainingAmount")} 
              />
              {errors.remainingAmount && <p className="text-sm text-red-500">{errors.remainingAmount.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Interest Rate (%)</label>
              <Input 
                placeholder="Annual interest rate" 
                type="number" 
                step="0.01" 
                {...register("interestRate")} 
              />
              {errors.interestRate && <p className="text-sm text-red-500">{errors.interestRate.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Minimum Monthly Payment</label>
              <Input 
                placeholder="Required monthly payment" 
                type="number" 
                step="0.01" 
                {...register("minimumPayment")} 
              />
              {errors.minimumPayment && <p className="text-sm text-red-500">{errors.minimumPayment.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" size="default" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                variant="default"
                size="default"
                className="flex-1"
              >
                Add Debt
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
