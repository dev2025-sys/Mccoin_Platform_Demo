"use client";
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
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const coins = [
  {
    id: "knc",
    name: "KNC",
    price: 0.74,
    change: 10.02,
    image: "/images/knc.svg",
  },
  {
    id: "luna",
    name: "LUNA",
    price: 0.6435,
    change: 12.44,
    image: "/images/luna.svg",
  },
  {
    id: "dia",
    name: "DIA",
    price: 0.3122,
    change: 66.12,
    image: "/images/dia.svg",
  },
  {
    id: "cvx",
    name: "CVX",
    price: 0.65,
    change: 14.9,
    image: "/images/cvx.svg",
  },
];

export default function SignInPage() {
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
        toast.success("Welcome back!");
        push("/");
      } else {
        toast.error("Login not complete");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Login failed");
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
          <h1 className="text-3xl font-bold text-white">
            Invest in McC<span className="text-[#EC3B3B]">o</span>in
          </h1>
          <h1 className="text-3xl font-bold text-white">Way to Trade</h1>
          <p className="text-sm text-[#8CA3D5]">
            The global crypto currency exchange
          </p>
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
          <h2 className="text-2xl mt-2">Log in to your</h2>
          <h2 className="text-2xl">
            <span className="text-[#EC3B3B]">McCoin</span> account
          </h2>

          <p className="text-[#DAE6EA] mt-2 text-sm">
            Please login with your account with the McCoin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label>Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
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
              />
              <div
                className="absolute right-3 top-2.5 cursor-pointer text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[#EC3B3B] text-sm underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            className="w-full bg-[#EC3B3B] hover:bg-red-600 transition-all duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>

          <p className="text-center text-sm text-[#DAE6EA]">
            Don’t have an account?{" "}
            <Link href="/sign-up" className="text-[#EC3B3B] underline">
              Register now!
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
