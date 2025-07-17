"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { SumsubLogo } from "@/components/custom/SumsubLogo";
import Image from "next/image";

// Zod schema for the entire form – individual steps will validate subsets
const verificationSchema = z.object({
  introConfirmed: z.boolean().refine((v) => v === true, {
    message: "You must acknowledge the introduction to continue",
  }),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  dateOfBirth: z
    .string()
    .min(1, { message: "Date of birth is required" })
    .refine(
      (dateString) => {
        const birthDate = new Date(dateString);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Calculate exact age considering month and day
        const exactAge =
          age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);

        return exactAge >= 18;
      },
      {
        message: "You must be at least 18 years old to proceed",
      }
    ),
  country: z.string().min(1, { message: "Country is required" }),
  documentType: z
    .enum(["passport", "driver_license", "national_id"])
    .optional(),
  documentFront: z.instanceof(File).optional(),
  documentBack: z.instanceof(File).optional(),
  selfie: z.instanceof(File).optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

type CountryOption = {
  code: string;
  name: string;
  emoji?: string;
  img?: string;
};

const steps = [
  "Introduction",
  "Personal Info",
  "Document Type",
  "Upload Documents",
  "Review & Submit",
] as const;

export default function KYCVerificationForm() {
  const [step, setStep] = useState(0);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<"loading" | "success">(
    "loading"
  );
  const [photoStatus, setPhotoStatus] = useState<"loading" | "success">(
    "loading"
  );
  const [finalStatus, setFinalStatus] = useState<"hidden" | "success">(
    "hidden"
  );
  const router = useRouter();

  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,flag,flags"
        );
        const data = await res.json();
        console.log("Sample country data:", data[0]); // Debug log
        const list: CountryOption[] = data
          .map((c: any) => ({
            code: c.cca2,
            name: c.name?.common || c.name?.official || "Unknown",
            emoji: c.flag ?? "",
            img: c.flags?.svg || c.flags?.png || "",
          }))
          .filter((c: CountryOption) => c.name && c.code) // Filter out invalid entries
          .sort((a: CountryOption, b: CountryOption) =>
            a.name.localeCompare(b.name)
          );
        console.log("Processed countries:", list.slice(0, 3)); // Debug log
        setCountries(list);
      } catch (e) {
        console.error("Failed to fetch countries", e);
      }
    }
    loadCountries();
  }, []);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      country: "",
      introConfirmed: false,
      documentType: undefined,
      documentFront: undefined,
      documentBack: undefined,
      selfie: undefined,
    },
  });

  const nextStep = async () => {
    if (step === 0) {
      const { introConfirmed } = form.getValues();
      if (!introConfirmed) {
        toast.error("Please confirm you understand the verification process");
        return;
      }
    } else if (step === 1) {
      const valid = await form.trigger([
        "firstName",
        "lastName",
        "dateOfBirth",
        "country",
      ]);
      if (!valid) {
        // Check specifically for age validation and show toast
        const { dateOfBirth } = form.getValues();
        if (dateOfBirth) {
          const birthDate = new Date(dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          // Calculate exact age considering month and day
          const exactAge =
            age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);

          if (exactAge < 18) {
            toast.error(
              "You must be at least 18 years old to proceed with verification"
            );
          }
        }
        return;
      }
    } else if (step === 2) {
      const { documentType } = form.getValues();
      if (!documentType) {
        toast.error("Please select a document type");
        return;
      }
    } else if (step === 3) {
      const { documentFront, selfie } = form.getValues();
      if (!documentFront || !selfie) {
        toast.error("Please upload required documents and selfie");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (values: VerificationFormValues) => {
    try {
      setShowModal(true);
      setDocumentStatus("loading");
      setPhotoStatus("loading");
      setFinalStatus("hidden");

      // Simulate document verification (8 seconds)
      setTimeout(() => {
        setDocumentStatus("success");
        setPhotoStatus("success");

        // Show final success message after 2 more seconds
        setTimeout(() => {
          setFinalStatus("success");

          // Store verification status in localStorage
          localStorage.setItem("userVerificationStatus", "verified");

          // Redirect to dashboard after 2 more seconds
          setTimeout(() => {
            router.push("/dashboard/assets");
          }, 2000);
        }, 2000);
      }, 8000);

      // Create FormData to send files
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          body.append(key, value);
        } else {
          body.append(key, String(value));
        }
      });

      // Replace with real endpoint when backend is ready
      // const res = await fetch("/api/kyc/submit", { method: "POST", body });
      // if (!res.ok) throw new Error("Submission failed");
      // console.log("KYC data submitted", values);
      // toast.success("Verification data submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit verification data");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 text-white">
            <div className="mb-0 mt-8">
              <Image
                src="/images/coin.png"
                alt="Mccoin Coin"
                width={70}
                height={70}
                className="mx-auto block"
              />
            </div>
            {/* Sumsub Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <blockquote>Powered By</blockquote> <SumsubLogo />
            </div>
            <p>
              To comply with regulations and keep our platform secure, we need
              to verify your identity. This process takes only a few minutes and
              requires some personal details and identity documents.
            </p>
            <p>Here’s how it works:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fill in your personal information.</li>
              <li>Select and upload your identity document.</li>
              <li>Upload a selfie for liveness check.</li>
              <li>We review your submission, usually within minutes.</li>
            </ul>
            <FormField
              control={form.control}
              name="introConfirmed"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <FormControl>
                    <Checkbox
                      id="introConfirmed"
                      checked={field.value}
                      onCheckedChange={field.onChange as any}
                      className="bg-[#FFF] checked:bg-[#FFF]"
                    />
                  </FormControl>
                  <FormLabel htmlFor="introConfirmed" className="text-white">
                    I have read and understood the verification process.
                  </FormLabel>
                  <div className="h-6">
                    <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">First Name</FormLabel>
                    <FormControl>
                      <Input
                        className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                        placeholder="Enter your first name"
                        {...field}
                      />
                    </FormControl>
                    <div className="h-6">
                      <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                        placeholder="Enter your last name"
                        {...field}
                      />
                    </FormControl>
                    <div className="h-6">
                      <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                        {...field}
                      />
                    </FormControl>
                    <div className="h-6">
                      <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-white border border-slate-300 w-[100%]">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            <div className="flex items-center">
                              {country.emoji ? (
                                <span className="mr-2 text-lg">
                                  {country.emoji}
                                </span>
                              ) : country.img ? (
                                <img
                                  src={country.img}
                                  alt={`${country.name} flag`}
                                  className="w-6 h-4 mr-2 object-cover rounded-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="mr-2 w-6 h-4 bg-gray-300 rounded-sm"></span>
                              )}
                              {country.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="h-6">
                      <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-white">
                  Select Document Type
                </FormLabel>
                <RadioGroup
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem
                        value="passport"
                        id="passport"
                        className="text-white bg-white"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="passport"
                      className="font-normal text-white"
                    >
                      Passport
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem
                        className="text-white bg-white"
                        value="driver_license"
                        id="driver_license"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="driver_license"
                      className="font-normal text-white"
                    >
                      Driver's License
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem
                        className="text-white bg-white"
                        value="national_id"
                        id="national_id"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="national_id"
                      className="font-normal text-white"
                    >
                      National ID
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
                <div className="h-6">
                  <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                </div>
              </FormItem>
            )}
          />
        );
      case 3:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="documentFront"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Document Front</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-white border border-slate-300 file:text-white file:bg-transparent file:border-0 file:mr-4"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <div className="h-6">
                    <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentBack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Document Back (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-white border border-slate-300 file:text-white file:bg-transparent file:border-0 file:mr-4"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <div className="h-6">
                    <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selfie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Selfie</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="text-white border border-slate-300 file:text-white file:bg-transparent file:border-0 file:mr-4"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <div className="h-6">
                    <FormMessage className="text-red-500 text-sm transition-opacity duration-300" />
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      case 4:
        // Review step
        const values = form.getValues();
        return (
          <div className="space-y-4 text-white">
            <h3 className="text-xl font-semibold">Review your information</h3>
            <div>
              <p>
                <span className="font-semibold">Name:</span> {values.firstName}{" "}
                {values.lastName}
              </p>
              <p>
                <span className="font-semibold">DOB:</span> {values.dateOfBirth}
              </p>
              <p>
                <span className="font-semibold">Country:</span> {values.country}
              </p>
              <p>
                <span className="font-semibold">Document Type:</span>{" "}
                {values.documentType}
              </p>
              <p>
                <span className="font-semibold">Document Front:</span>{" "}
                {values.documentFront
                  ? (values.documentFront as File).name
                  : ""}
              </p>
              {values.documentBack && (
                <p>
                  <span className="font-semibold">Document Back:</span>{" "}
                  {(values.documentBack as File).name}
                </p>
              )}
              <p>
                <span className="font-semibold">Selfie:</span>{" "}
                {values.selfie ? (values.selfie as File).name : ""}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-[#0F1D40] p-6 rounded-lg shadow-lg"
      >
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    idx <= step
                      ? "bg-[#ec3b3b] text-white border-[#ec3b3b]"
                      : "border-gray-400 text-gray-400"
                  )}
                >
                  {idx + 1}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded transition-all duration-500",
                    idx < step ? "bg-[#ec3b3b]" : "bg-gray-400",
                    idx < step ? "w-full" : "w-0"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="text-[#0F1D40] border-white hover:bg-white hover:text-[#0F1D40]"
              onClick={prevStep}
            >
              Back
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button
              type="button"
              className="bg-[#ec3b3b] text-white hover:bg-white hover:text-[#ec3b3b] hover:border-[#ec3b3b]"
              onClick={nextStep}
            >
              Next
            </Button>
          )}
          {step === steps.length - 1 && (
            <Button
              type="submit"
              className="bg-[#ec3b3b] text-white hover:bg-white hover:text-[#ec3b3b] hover:border-[#ec3b3b]"
            >
              Submit
            </Button>
          )}
        </div>
      </form>

      {/* Verification Modal */}
      <Dialog open={showModal}>
        <DialogContent
          className="sm:max-w-md bg-[#0F1D40] border-slate-600"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">
              Verification is Under Process...
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Document Identification */}
            <div className="flex items-center justify-between">
              <span className="text-white">Documents Identification</span>
              {documentStatus === "loading" ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            {/* Photo Verification */}
            <div className="flex items-center justify-between">
              <span className="text-white">Photo Verification</span>
              {photoStatus === "loading" ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            {/* Final Success Message */}
            {finalStatus === "success" && (
              <div className="flex items-center justify-center space-x-2 pt-4 border-t border-slate-600">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-green-500 font-semibold text-lg">
                  User Verification Successful
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
