import { redirect } from "next/navigation";

export default function AssetsPage() {
  redirect("/dashboard/assets/overview");
  return null;
}
