"use client";
import { useEffect } from "react";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import RotatingIcons from "@/components/custom/RotatingIcons";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { useLocale } from "next-intl";

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const codeSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

export default function SignUpPage() {
  const t = useTranslations("signUp");
  const isArabic = useLocale() === "ar";
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { push } = useRouter();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, router]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm({ resolver: zodResolver(codeSchema) });

  const onSignUp = async (data: any) => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setEmailAddress(data.email);
      setPendingVerification(true);
      toast.success(t("verification_code_sent"));
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || t("signup_failed"));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async (data: any) => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      const complete = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (complete.status === "complete") {
        await setActive({ session: complete.createdSessionId });
        toast.success(t("verification_success"));
        push("/");
      } else {
        toast.error(t("verification_failed"));
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || t("verification_failed"));
    } finally {
      setLoading(false);
    }
  };
  if (isSignedIn === null) {
    return <div className="text-white text-center py-10">Loading...</div>;
  }
  return (
    <div className="min-h-screen flex md:flex-row flex-col items-center justify-center bg-[#07153B] text-white px-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md md:h-[600px] p-6 space-y-6 shadow-2xl backdrop-blur-sm"
        style={{
          background: "linear-gradient(135deg, #1A0A2E 0%, #2A1A4A 100%)",
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(149, 117, 205, 0.15)",
        }}
      >
        {/* Back button */}
        {isArabic ? (
          <button
            className="flex items-center text-sm text-[#8CA3D5] hover:text-white transition-colors"
            style={{
              direction: isArabic ? "rtl" : "ltr",
            }}
          >
            <FaArrowRight className="ml-1 w-4 h-4" />
            {t("back")}
          </button>
        ) : (
          <button
            className="flex items-center text-sm text-[#8CA3D5] hover:text-white transition-colors"
            style={{
              direction: isArabic ? "rtl" : "ltr",
            }}
          >
            <FaArrowLeft className="mr-1 w-4 h-4" />
            {t("back")}
          </button>
        )}

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-4xl text-white tracking-wider leading-7">
            {t("headline1")}
          </h1>
          <h1 className="text-4xl text-white leading-7 tracking-wider">
            {t("headline2")}
          </h1>
          <h1 className="text-4xl text-white leading-7 tracking-wider">
            {t("headline3")}
          </h1>
          <p className="text-sm text-slate-400 mt-6">{t("tagline")}</p>
        </div>
        <RotatingIcons />
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full h-[600px] max-w-md pt-12 px-6 space-y-6 bg-[#050E27] shadow-xl"
      >
        <div>
          <Image
            src="/images/signup_pic.svg"
            alt="logo"
            width={40}
            height={40}
          />
          <h2 className="text-2xl mt-2">{t("title1")}</h2>
          <h2 className="text-2xl">
            <span className="text-[#EC3B3B]">{t("title2")}</span> {t("title3")}
          </h2>

          <p className="text-[#DAE6EA] mt-2 text-sm">{t("subtitle")}</p>
        </div>

        {!pendingVerification ? (
          <form onSubmit={handleSubmit(onSignUp)} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label>{t("email")}</label>
              <Input
                {...register("email")}
                placeholder={t("email")}
                className="p-6"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label>{t("password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  {...register("password")}
                  className="p-6"
                />
                <div
                  className={`absolute ${
                    isArabic ? "left-3" : "right-3"
                  } top-3.5 cursor-pointer text-white`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label>{t("repeatPassword")}</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("repeatPassword")}
                  {...register("confirmPassword")}
                  className="p-6"
                />
                <div
                  className={`absolute ${
                    isArabic ? "left-3" : "right-3"
                  } top-3.5 cursor-pointer text-white`}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div id="clerk-captcha" className="mt-2" />

            <Button
              className="w-full bg-[#EC3B3B] hover:bg-red-600 transition-all duration-200 p-6"
              type="submit"
              disabled={loading}
            >
              {loading ? t("signingUp") : t("button")}
            </Button>

            <p className="text-center text-sm text-[#DAE6EA]">
              {t("haveAccount")}{" "}
              <Link href="/sign-in" className="text-[#EC3B3B] underline">
                {t("login")}
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit(onVerifyCode)} className="space-y-5">
            <div>
              <label>{t("verificationCode")}</label>
              <Input {...registerCode("code")} placeholder={t("enterCode")} />
              {codeErrors.code && (
                <p className="text-red-400 text-sm">
                  {codeErrors.code.message}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-[#EC3B3B] hover:bg-red-600 transition-all duration-200"
              type="submit"
              disabled={loading}
            >
              {loading ? t("verifying") : t("verifyButton")}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
