import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

// The /interns route is now /employees for the new role naming.
// Redirect permanently to /employees.
export default async function InternsPage() {
  const { profile } = await getSessionProfile();
  
  if (profile.role !== "lead") {
    redirect("/dashboard");
  }
  
  redirect("/employees");
}
