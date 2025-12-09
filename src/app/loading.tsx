import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <Spinner size="lg" />
    </div>
  );
}
