"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
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
                  ✔️ {t("verified")}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[#DAE6EA]">{t("mobile")}</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("addPhone")}
                  className="bg-[#0f294d] text-[#DAE6EA] p-6"
                />
                <Button className="p-6" variant="outline">
                  {t("connect")}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[#DAE6EA]">{t("totp")}</label>
              <div className="flex items-center gap-2">
                <Input
                  className="bg-[#0f294d] text-[#DAE6EA] p-6"
                  placeholder={t("enterCode")}
                />
                <Button className="p-6" variant="outline">
                  {t("connect")}
                </Button>
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
                onClick={() => router.push("/forgot-password")}
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
          <CardContent className="overflow-x-auto">
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
          <CardContent className="overflow-x-auto">
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
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
