"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
export default function PreferencesTab() {
  const t = useTranslations("dashboard.preferences");
  const { setTheme, theme } = useTheme();
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-[#081935] border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardHeader>
          <CardTitle className="text-white text-xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-[#DAE6EA]">{t("currency")}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-[#0f294d] text-white w-24 px-3">
                    <SelectValue placeholder={t("selectCurrency")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#081935] text-white">
                    <SelectItem value="USD">{t("currencies.USD")}</SelectItem>
                    <SelectItem value="EUR">{t("currencies.EUR")}</SelectItem>
                    <SelectItem value="AED">{t("currencies.AED")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#DAE6EA]">{t("language")}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-[#0f294d] text-white w-24 px-3">
                    <SelectValue placeholder={t("selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#081935] text-white">
                    <SelectItem value="English" dir={isArabic ? "rtl" : "ltr"}>
                      {t("languages.English")}
                    </SelectItem>
                    <SelectItem
                      value="Arabic"
                      dir={isArabic ? "rtl" : "ltr"}
                      className="text-right"
                    >
                      {t("languages.Arabic")}
                    </SelectItem>
                    <SelectItem
                      value="French"
                      dir={isArabic ? "rtl" : "ltr"}
                      className="text-right"
                    >
                      {t("languages.French")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#DAE6EA]">{t("darkMode")}</Label>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                  className={`data-[state=checked]:bg-[#EC3B3B] 
              data-[state=unchecked]:bg-slate-500 
              data-[state=unchecked]:border 
              data-[state=unchecked]:border-gray-400`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
