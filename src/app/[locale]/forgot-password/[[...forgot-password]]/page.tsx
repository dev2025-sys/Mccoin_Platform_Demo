"use client";

import { useSignIn } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const emailSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z
  .object({
    code: z.string().length(6, "Enter the 6-digit code"),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const [pendingReset, setPendingReset] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onRequestReset = async (data: any) => {
    if (!isLoaded) return;
    try {
      setLoading(true);

      const attempt = await signIn.create({ identifier: data.email });

      const emailFactor = attempt.supportedFirstFactors?.find(
        (
          f
        ): f is {
          strategy: "reset_password_email_code";
          emailAddressId: string;
          safeIdentifier: string;
          primary?: boolean;
        } => f.strategy === "reset_password_email_code"
      );

      if (!emailFactor?.emailAddressId) {
        throw new Error("Email address ID not found");
      }

      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor.emailAddressId,
      });

      setEmail(data.email);
      setPendingReset(true);
      toast.success("Reset code sent to your email");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.errors?.[0]?.message || err.message || "Error requesting reset"
      );
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: any) => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password reset successful");
        router.push("/");
      } else {
        toast.error("Reset not complete");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07153B] text-white px-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-6 space-y-6 bg-[#081935] rounded-xl shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t("title")}</h2>
          <p className="text-[#DAE6EA] mt-2 text-sm">
            {pendingReset ? t("subtitleWithEmail", { email }) : t("subtitle")}
          </p>
        </div>

        {!pendingReset ? (
          <form onSubmit={handleSubmit(onRequestReset)} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label>{t("email")}</label>
              <Input {...register("email")} placeholder={t("email")} />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#EC3B3B] hover:bg-red-600"
              disabled={loading}
            >
              {loading ? t("sending") : t("sendCode")}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleResetSubmit(onResetPassword)}
            className="space-y-5"
          >
            <div>
              <label>{t("code")}</label>
              <Input {...registerReset("code")} placeholder={t("enterCode")} />
              {resetErrors.code && (
                <p className="text-red-400 text-sm">
                  {resetErrors.code.message}
                </p>
              )}
            </div>

            <div>
              <label>{t("password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...registerReset("password")}
                  placeholder={t("enterNewPassword")}
                />
                <div
                  className="absolute right-3 top-2.5 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {resetErrors.password && (
                <p className="text-red-400 text-sm">
                  {resetErrors.password.message}
                </p>
              )}
            </div>

            <div>
              <label>{t("confirmPassword")}</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  {...registerReset("confirmPassword")}
                  placeholder={t("repeatNewPassword")}
                />
                <div
                  className="absolute right-3 top-2.5 cursor-pointer"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {resetErrors.confirmPassword && (
                <p className="text-red-400 text-sm">
                  {resetErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#EC3B3B] hover:bg-red-600"
              disabled={loading}
            >
              {loading ? t("resetting") : t("reset")}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
