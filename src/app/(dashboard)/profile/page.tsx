import { getSessionProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Profile | HCT Tracker",
  description: "Manage your account details and preferences",
};

export default async function ProfilePage() {
  const { profile } = await getSessionProfile();

  return (
    <section className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-100">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account name and avatar.
        </p>
      </div>

      <div className="max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
