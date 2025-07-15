"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
}

export default function VerificationBadge({
  isVerified,
  size = "md",
}: VerificationBadgeProps) {
  const t = useTranslations("verification");
  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
    lg: "w-6 h-6 text-base",
  };

  if (isVerified) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full flex items-center justify-center ${sizeClasses[size]} shadow-lg border-2 border-white`}
        title={t("verified")}
      >
        <Check className="w-3 h-3" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`absolute -bottom-1 -right-1 bg-gray-400 text-white rounded-full flex items-center justify-center ${sizeClasses[size]} shadow-lg border-2 border-white`}
      title={t("not_verified")}
    >
      <X className="w-3 h-3" />
    </motion.div>
  );
}
