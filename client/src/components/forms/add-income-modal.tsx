import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { IncomeCategory, PaymentMethod } from "@shared/schema";

const addIncomeSchema = z.object({
  categoryId: z.string().min(1, "Please select an income category"),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paymentMethodId: z.string().min(1, "Please select a payment method"),
});

type AddIncomeFormData = z.infer<typeof addIncomeSchema>;

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const { toast } = useToast();

  const form = useForm<AddIncomeFormData>({
    resolver: zodResolver(addIncomeSchema),
    defaultValues: {
      categoryId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethodId: "",
    },
  });

  // Fetch categories and payment methods
  const { data: incomeCategories, error: categoriesError } = useQuery<IncomeCategory[]>({
    queryKey: ["/api/income-categories"],
    enabled: open,
  });

  const { data: paymentMethods, error: paymentMethodsError } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
    enabled: open,
  });

  // Handle errors
  useEffect(() => {
    const errors = [categoriesError, paymentMethodsError];
    for (const error of errors) {
      if (error && isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        break;
      }
    }
  }, [categoriesError, paymentMethodsError, toast]);

  const createIncomeMutation = useMutation({
    mutationFn: async (data: AddIncomeFormData) => {
      const payload = {
        categoryId: parseInt(data.categoryId),
        amount: data.amount,
        description: data.description || null,
        date: data.date,
        paymentMethodId: parseInt(data.paymentMethodId),
      };
      await apiRequest('POST', '/api/income', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Income added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddIncomeFormData) => {
    createIncomeMutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-add-income">
        <DialogHeader>
          <DialogTitle data-testid="text-add-income-title">Add Income</DialogTitle>
          <DialogDescription data-testid="text-add-income-description">
            Add a new income entry to track your earnings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-income-category">
                        <SelectValue placeholder="Select income type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{category.name}</span>
                            {category.incomeEarnerName && (
                              <span className="text-sm text-muted-foreground">Earner: {category.incomeEarnerName}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-income-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      data-testid="input-income-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Income description"
                      rows={2}
                      data-testid="input-income-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-income-payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods?.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-income"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createIncomeMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-save-income"
              >
                {createIncomeMutation.isPending ? "Saving..." : "Save Income"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
