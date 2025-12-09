import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-12">
      <Spinner size="lg" />
    </div>
  );
}
