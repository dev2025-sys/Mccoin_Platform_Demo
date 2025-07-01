"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function SignInPage() {
  const t = useTranslations("signIn");
  const isArabic = useLocale() === "ar";
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, router]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: any) => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success(t("login_success"));
        push("/");
      } else {
        toast.error(t("login_failed"));
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || t("login_failed"));
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
          <Link
            href="/"
            className="flex items-center text-sm text-[#8CA3D5] hover:text-white transition-colors"
            style={{
              direction: isArabic ? "rtl" : "ltr",
            }}
          >
            <FaArrowRight className="ml-1 w-4 h-4" />
            {t("back")}
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center text-sm text-[#8CA3D5] hover:text-white transition-colors"
            style={{
              direction: isArabic ? "rtl" : "ltr",
            }}
          >
            <FaArrowLeft className="mr-1 w-4 h-4" />
            {t("back")}
          </Link>
        )}

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            {t("title4_1")} McC<span className="text-[#EC3B3B]">o</span>in
          </h1>
          <h1 className="text-3xl font-bold text-white">{t("title6")}</h1>
          <p className="text-sm text-[#8CA3D5]">{t("title5")}</p>
        </div>

        {/* Coin grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* KNO */}
          <div className="bg-[#050E27] rounded-xl p-4 backdrop-blur-sm shadow-2xl border border-slate-600">
            <div className="flex flex-col gap-3 mb-3">
              <Image src="/images/knc.svg" alt="knc" width={32} height={32} />
              <p className="text-white font-medium">KNO</p>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-white text-lg font-semibold">0.74</p>
              <p className="text-green-400 text-sm flex items-center gap-1">
                10.03% <ArrowUp className="w-4 h-4" />
              </p>
            </div>
          </div>

          {/* LUNA */}
          <div className="bg-[#050E27] rounded-xl p-4 backdrop-blur-sm shadow-2xl border border-slate-600">
            <div className="flex flex-col gap-3 mb-3">
              <Image src="/images/luna.svg" alt="luna" width={32} height={32} />
              <p className="text-white font-medium">LUNA</p>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-white text-lg font-semibold">0.6345</p>
              <p className="text-red-400 text-sm flex items-center gap-1">
                10.02% <ArrowDown className="w-4 h-4" />
              </p>
            </div>
          </div>

          {/* DIA */}
          <div className="bg-[#050E27] rounded-xl p-4 backdrop-blur-sm shadow-2xl border border-slate-600">
            <div className="flex flex-col gap-3 mb-3">
              <Image src="/images/dia.svg" alt="dia" width={32} height={32} />
              <p className="text-white font-medium">DIA</p>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-white text-lg font-semibold">0.32423</p>
              <p className="text-red-400 text-sm flex items-center gap-1">
                10.03% <ArrowDown className="w-4 h-4" />
              </p>
            </div>
          </div>

          {/* CVX */}
          <div className="bg-[#050E27] rounded-xl p-4 backdrop-blur-sm shadow-2xl border border-slate-600">
            <div className="flex flex-col gap-3 mb-3">
              <Image src="/images/cvx.svg" alt="cvx" width={32} height={32} />
              <p className="text-white font-medium">CVX</p>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-white text-lg font-semibold">0.74</p>
              <p className="text-green-400 text-sm flex items-center gap-1">
                10.03% <ArrowUp className="w-4 h-4" />
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full h-[600px] max-w-md pt-12 px-6 space-y-6 bg-[#050E27] shadow-xl"
      >
        <div>
          <Image
            src="/images/login_pic.svg"
            alt="logo"
            width={40}
            height={40}
          />
          <h2 className="text-2xl mt-2">
            {t("title1")} <span className="text-[#EC3B3B]">{t("title2")}</span>{" "}
            {t("title3")}
          </h2>

          <p className="text-[#DAE6EA] mt-2 text-sm">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label>{t("email")}</label>
            <Input
              type="email"
              placeholder={t("email")}
              {...register("email")}
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
              />
              <div
                className={`absolute ${
                  isArabic ? "left-3" : "right-3"
                } top-2.5 cursor-pointer text-white`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div
            className={`flex ${isArabic ? "justify-start" : "justify-end"}`}
            style={{
              direction: isArabic ? "rtl" : "ltr",
            }}
          >
            <Link
              href="/forgot-password"
              className="text-[#EC3B3B] text-sm underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button
            className="w-full bg-[#EC3B3B] hover:bg-red-600 transition-all duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("button")
            )}
          </Button>

          <p className="text-center text-sm text-[#DAE6EA]">
            {t("noAccount")}
            <Link href="/sign-up" className="text-[#EC3B3B] underline">
              {t("registerNow")}
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
