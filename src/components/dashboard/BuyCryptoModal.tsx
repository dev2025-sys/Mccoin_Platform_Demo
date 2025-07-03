"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, DollarSign } from "lucide-react";
import {
  FaBitcoin,
  FaEthereum,
  FaCreditCard,
  FaApplePay,
  FaGooglePay,
  FaUniversity,
} from "react-icons/fa";
import { SiTether } from "react-icons/si";

const formSchema = z.object({
  cryptocurrency: z.string().min(1, "Please select a cryptocurrency"),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 10;
  }, "Amount must be at least $10"),
  paymentMethod: z.enum(
    ["credit_card", "apple_pay", "google_pay", "bank_transfer"],
    {
      required_error: "Please select a payment method",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const cryptoRates = {
  BTC: 0.000024,
  ETH: 0.00041,
  USDT: 1,
};

const cryptoIcons = {
  BTC: <FaBitcoin className="w-5 h-5 text-[#F7931A]" />,
  ETH: <FaEthereum className="w-5 h-5 text-[#627EEA]" />,
  USDT: <SiTether className="w-5 h-5 text-[#26A17B]" />,
};

const paymentMethods = [
  {
    id: "credit_card",
    name: "Credit Card",
    icon: <FaCreditCard className="w-5 h-5" />,
    description: "Fast & secure payment",
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    icon: <FaApplePay className="w-5 h-5" />,
    description: "Quick mobile payment",
  },
  {
    id: "google_pay",
    name: "Google Pay",
    icon: <FaGooglePay className="w-5 h-5" />,
    description: "Easy digital payment",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: <FaUniversity className="w-5 h-5" />,
    description: "Direct bank transfer",
  },
];

export function BuyCryptoModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState("0");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cryptocurrency: "",
      amount: "",
      paymentMethod: "credit_card",
    },
  });

  const calculateEstimatedAmount = (amount: string, crypto: string) => {
    const numAmount = parseFloat(amount) || 0;
    const rate = cryptoRates[crypto as keyof typeof cryptoRates] || 0;
    return (numAmount * rate).toFixed(8);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Purchase Complete!", {
      description: `Successfully purchased ${estimatedAmount} ${data.cryptocurrency}`,
    });
    setIsSubmitting(false);
    setOpen(false);
    form.reset();
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#EC3B3B] hover:bg-[#d02f2f] text-white w-[120px] flex items-center">
            <FaBitcoin className="w-4 h-4 mr-2" /> Buy Crypto
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-[#DAE6EA] max-h-[90vh] overflow-y-auto w-full p-4 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-[#07153B] text-xl font-semibold flex items-center gap-2">
              <FaBitcoin className="w-6 h-6 text-[#EC3B3B]" />
              Buy Cryptocurrency
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <FormField
                control={form.control}
                name="cryptocurrency"
                render={({ field }) => (
                  <FormItem className="min-h-[80px]">
                    <FormLabel className="text-[#07153B] font-medium">
                      Select Cryptocurrency
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setEstimatedAmount(
                          calculateEstimatedAmount(
                            form.getValues("amount"),
                            value
                          )
                        );
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-2 border-[#07153B]/10 focus:border-[#EC3B3B] focus:ring-[#EC3B3B] h-12 w-full">
                          <SelectValue placeholder="Select a cryptocurrency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(cryptoIcons).map(([value, icon]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="h-12 flex items-center gap-2 cursor-pointer hover:bg-[#DAE6EA]/50"
                          >
                            {icon}
                            <span>{value}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="min-h-[80px]">
                    <FormLabel className="text-[#07153B] font-medium">
                      Amount in USD
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount (min $10)"
                          className="bg-white pl-10 border-2 border-[#07153B]/10 focus:border-[#EC3B3B] focus:ring-[#EC3B3B] h-12 w-full"
                          min="10"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setEstimatedAmount(
                              calculateEstimatedAmount(
                                e.target.value,
                                form.getValues("cryptocurrency")
                              )
                            );
                          }}
                        />
                      </FormControl>
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    </div>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <FormItem className="min-h-[80px]">
                <FormLabel className="text-[#07153B] font-medium">
                  Estimated Amount
                </FormLabel>
                <div className="relative">
                  <Input
                    type="text"
                    value={`${estimatedAmount} ${
                      form.getValues("cryptocurrency") || "---"
                    }`}
                    className="bg-white pl-10 border-2 border-[#07153B]/10 h-12 w-full"
                    readOnly
                  />
                  {form.getValues("cryptocurrency") && (
                    <div className="absolute left-3 top-3">
                      {
                        cryptoIcons[
                          form.getValues(
                            "cryptocurrency"
                          ) as keyof typeof cryptoIcons
                        ]
                      }
                    </div>
                  )}
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="min-h-[80px]">
                    <FormLabel className="text-[#07153B] font-medium">
                      Payment Method
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-3"
                      >
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`relative flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all
                              ${
                                field.value === method.id
                                  ? "border-[#EC3B3B] bg-[#EC3B3B]/5"
                                  : "border-[#07153B]/10 hover:border-[#EC3B3B]/50"
                              }`}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 w-full m-0">
                              <FormControl>
                                <RadioGroupItem value={method.id} />
                              </FormControl>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                  <div className="text-[#07153B]">
                                    {method.icon}
                                  </div>
                                  <div>
                                    <FormLabel className="font-medium text-[#07153B] cursor-pointer">
                                      {method.name}
                                    </FormLabel>
                                    <p className="text-sm text-gray-500">
                                      {method.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </FormItem>
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row justify-end sm:space-x-2 space-y-2 sm:space-y-0 pt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="bg-white border-2 border-[#07153B]/10 hover:bg-[#07153B]/5 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#EC3B3B] hover:bg-[#d02f2f] text-white w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
