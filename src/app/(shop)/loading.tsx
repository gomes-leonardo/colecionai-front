import { Spinner } from "@/components/ui/spinner";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 animate-pulse">Carregando loja...</p>
      </div>
    </div>
  );
}
