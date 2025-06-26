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

export default function PreferencesTab() {
  const { setTheme, theme } = useTheme();
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(theme === "dark");

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
          <CardTitle className="text-white text-xl">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-[#DAE6EA]">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-[#0f294d] text-white w-24 px-3">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#081935] text-white">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#DAE6EA]">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-[#0f294d] text-white w-24 px-3">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#081935] text-white">
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#DAE6EA]">Dark mode</Label>
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
