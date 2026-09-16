import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { SetupRequired } from "@/components/setup-required";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-surface-app p-4">
      <form action={signUpAction} className="grid w-full max-w-sm gap-4 rounded-lg border border-surface-line bg-surface-panel p-5">
        <div>
          <h1 className="text-xl font-semibold">Create lead account</h1>
          <p className="mt-1 text-sm text-slate-400">Only leads sign in. Interns are added and managed inside the app.</p>
        </div>
        {error ? <p className="rounded-md border border-red-900/70 bg-red-950/30 px-3 py-2 text-sm text-red-100">{error}</p> : null}
        <label className="grid gap-1 text-sm">Full name<input name="fullName" required className="rounded-md border-surface-line bg-surface-raised" /></label>
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" required className="rounded-md border-surface-line bg-surface-raised" /></label>
        <label className="grid gap-1 text-sm">Password<input name="password" type="password" required minLength={6} className="rounded-md border-surface-line bg-surface-raised" /></label>
        <button className="focus-ring rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500">Create account</button>
        <Link href="/login" className="text-sm text-sky-300 hover:text-sky-200">Already have an account?</Link>
      </form>
    </main>
  );
}
