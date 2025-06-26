"use client";
import { useEffect } from "react";
import { useSignUp, useAuth } from "@clerk/nextjs";
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
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Sign-up failed");
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
        toast.success("Account created successfully!");
        push("/");
      } else {
        toast.error("Verification incomplete");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Invalid code");
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
        <button className="flex items-center text-sm text-[#8CA3D5] hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </button>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-4xl text-white tracking-wider leading-7">
            The Global
          </h1>
          <h1 className="text-4xl text-white leading-7 tracking-wider">
            Cryptocurrency
          </h1>
          <h1 className="text-4xl text-white leading-7 tracking-wider">
            Exchange
          </h1>
          <p className="text-sm text-slate-400 mt-6">
            Serving 200+ Countries/Regions Worldwide
          </p>
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
          <h2 className="text-2xl mt-2">Create your</h2>
          <h2 className="text-2xl">
            <span className="text-[#EC3B3B]">McCoin</span> account
          </h2>

          <p className="text-[#DAE6EA] mt-2 text-sm">
            Please create your account with the McCoin
          </p>
        </div>

        {!pendingVerification ? (
          <form onSubmit={handleSubmit(onSignUp)} className="space-y-5">
            <div>
              <label>Email</label>
              <Input
                {...register("email")}
                placeholder="you@example.com"
                className="p-6"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label>Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                  className="p-6"
                />
                <div
                  className="absolute right-3 top-3.5 cursor-pointer text-white"
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

            <div>
              <label>Repeat Password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat password"
                  {...register("confirmPassword")}
                  className="p-6"
                />
                <div
                  className="absolute right-3 top-3.5 cursor-pointer text-white"
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
              {loading ? "Signing up..." : "Sign up"}
            </Button>

            <p className="text-center text-sm text-[#DAE6EA]">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#EC3B3B] underline">
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit(onVerifyCode)} className="space-y-5">
            <div>
              <label>Verification Code</label>
              <Input
                {...registerCode("code")}
                placeholder="Enter 6-digit code"
              />
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
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
