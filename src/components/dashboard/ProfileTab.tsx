"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

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
              Account Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[#DAE6EA]">Email</label>
              <div className="flex items-center gap-2">
                <Input
                  value={user?.emailAddresses[0]?.emailAddress || ""}
                  readOnly
                  className="bg-[#0f294d] text-[#DAE6EA] cursor-not-allowed p-6"
                />
                <Button className="p-6" variant="secondary" disabled>
                  ✔️ Verified
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[#DAE6EA]">Mobile</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add phone number"
                  className="bg-[#0f294d] text-[#DAE6EA] p-6"
                />
                <Button className="p-6" variant="outline">
                  Connect
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[#DAE6EA]">TOTP</label>
              <div className="flex items-center gap-2">
                <Input
                  className="bg-[#0f294d] text-[#DAE6EA] p-6"
                  placeholder="Enter verification code"
                />
                <Button className="p-6" variant="outline">
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF] text-2xl font-semibold">
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#DAE6EA]">Password</p>
                <p className="text-sm text-[#DAE6EA]">
                  Set a permanent password to login to your account
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/forgot-password")}
              >
                Reset password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login Status */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF] text-2xl font-semibold">
              Login Status Management
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[#DAE6EA]">
                <tr>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Device</th>
                  <th className="text-left py-2">IP</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Operation</th>
                </tr>
              </thead>
              <tbody>
                {loginData.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[#0f294d] text-[#DAE6EA]"
                  >
                    <td className="py-2">{entry.time}</td>
                    <td>{entry.device}</td>
                    <td>{entry.ip}</td>
                    <td>{entry.location}</td>
                    <td>
                      <Button variant="ghost" className="text-red-400">
                        Logout
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Login History */}
        <Card className="bg-[#081935] border-none">
          <CardHeader>
            <CardTitle className="text-[#FFF]">Login History</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[#DAE6EA]">
                <tr>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Device</th>
                  <th className="text-left py-2">IP</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Operation</th>
                </tr>
              </thead>
              <tbody>
                {loginData.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[#0f294d] text-[#DAE6EA]"
                  >
                    <td className="py-2">{entry.time}</td>
                    <td>{entry.device}</td>
                    <td>{entry.ip}</td>
                    <td>{entry.location}</td>
                    <td>
                      <Button variant="ghost" className="text-red-400">
                        Logout
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
