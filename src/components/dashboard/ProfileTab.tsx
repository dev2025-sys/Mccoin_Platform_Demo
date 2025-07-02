"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { MdCancel } from "react-icons/md";
import { FaPause } from "react-icons/fa";
import { GoVerified } from "react-icons/go";
const loginData = [
  {
    time: "Mon, Jan 22 2024 5:45:52 PM",
    device: "PC / Mac OS / Safari",
    ip: "45.13.191.108",
    location: "Oslo, Oslo County, Norway",
  },
  {
    time: "Sun, Jan 07 2024 7:05:49 PM",
    device: "PC / Mac OS / Safari",
    ip: "51.22.48.22",
    location: "Oshnavieh, Iran",
  },
  {
    time: "Wed, Nov 22 2023 12:14:42 PM",
    device: "PC / Mac OS / Safari",
    ip: "191.101.174.68",
    location: "Jersey City, United States",
  },
];

export default function ProfileTab() {
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const t = useTranslations("dashboard.profile");
  const locale = useLocale();
  const isArabic = locale === "ar";
  return (
    <main className="flex-1 border-[0.5px] rounded-md border-[#DAE6EA]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user?.fullName}</h2>
            <p className="text-sm text-[#DAE6EA]">
              {user?.emailAddresses[0]?.emailAddress || ""}
            </p>
          </div>
        </div>

        {/* Account Verification */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF] text-2xl font-semibold">
              {t("accountVerification")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[#DAE6EA]">{t("email")}</label>
              <div className="flex items-center gap-2">
                <Input
                  value={user?.emailAddresses[0]?.emailAddress || ""}
                  readOnly
                  className="bg-[#0f294d] text-[#DAE6EA] cursor-not-allowed p-6"
                />
                <Button className="p-6" variant="secondary" disabled>
                  {t("verified")}{" "}
                  <GoVerified className="w-6 h-6 text-green-500" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 my-4 pt-4">
              <h1 className="text-[#DAE6EA] text-2xl font-semibold">
                {t("account_control")}
              </h1>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <label className="text-[#DAE6EA]">{t("action")}</label>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                  <Button
                    className="p-4 sm:p-6 cursor-pointer w-full sm:w-auto"
                    variant="destructive"
                  >
                    <FaPause className="mr-2" />
                    {t("freeze_account")}
                  </Button>
                  <Button
                    className="p-4 sm:p-6 cursor-pointer w-full sm:w-auto"
                    variant="destructive"
                  >
                    <MdCancel className="mr-2" />
                    {t("cancel_account")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF] text-2xl font-semibold">
              {t("advancedSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#DAE6EA]">{t("password")}</p>
                <p className="text-sm text-[#DAE6EA]">{t("passwordDesc")}</p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut(); // end current session
                  router.push("/forgot-password");
                }}
              >
                {t("resetPassword")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login Status */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF] text-xl font-semibold">
              {t("loginStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="min-w-[600px] px-6 sm:px-0">
              <table className="w-full text-sm">
                <thead className="text-[#DAE6EA]">
                  <tr>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.time")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.device")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.ip")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.location")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.operation")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loginData.map((entry, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-[#0f294d] text-[#DAE6EA]"
                    >
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.time}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.device}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.ip}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.location}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        <Button variant="ghost" className="text-red-400">
                          {t("logout")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <div className="h-[1px] bg-[#0f294d] w-full"></div>
        {/* Login History */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF] text-xl font-semibold">
              {t("loginHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="min-w-[600px] px-6 sm:px-0">
              <table className="w-full text-sm">
                <thead className="text-[#DAE6EA]">
                  <tr>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.time")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.device")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.ip")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.location")}
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.operation")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loginData.map((entry, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-[#0f294d] text-[#DAE6EA]"
                    >
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.time}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.device}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.ip}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {entry.location}
                      </td>
                      <td
                        className={`py-2 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        <Button variant="ghost" className="text-red-400">
                          {t("logout")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
