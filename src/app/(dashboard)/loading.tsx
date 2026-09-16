import { SkeletonBlock } from "@/components/ui/state";

export default function Loading() {
  return (
    <section className="grid gap-4 p-4 md:p-6">
      <SkeletonBlock />
      <SkeletonBlock />
      <SkeletonBlock />
    </section>
  );
}
