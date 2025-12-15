import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCategory, ProductCondition } from "@/types";
import { Search } from "lucide-react";

interface AuctionFiltersProps {
  filters: {
    name?: string;
    category?: string;
    condition?: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const categoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.ACTION_FIGURES]: "Action Figures",
  [ProductCategory.COLLECTIBLE_STATUES]: "Estátuas Colecionáveis",
  [ProductCategory.FUNKO_POP]: "Funko Pop",
  [ProductCategory.TRADING_CARDS]: "Cards Colecionáveis",
  [ProductCategory.COMIC_BOOKS]: "Quadrinhos",
  [ProductCategory.MANGA]: "Mangá",
  [ProductCategory.RETRO_GAMES]: "Jogos Retrô",
  [ProductCategory.MINIATURES]: "Miniaturas",
  [ProductCategory.MODEL_KITS]: "Model Kits",
  [ProductCategory.MOVIES_TV_COLLECTIBLES]: "Colecionáveis de Filmes/TV",
  [ProductCategory.ANIME_COLLECTIBLES]: "Colecionáveis de Anime",
  [ProductCategory.ART_BOOKS]: "Art Books",
  [ProductCategory.RARE_COLLECTIBLES]: "Colecionáveis Raros",
};

const conditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: "Novo",
  [ProductCondition.USED]: "Usado",
  [ProductCondition.OPEN_BOX]: "Caixa Aberta",
};

export function AuctionFilters({ filters, onFilterChange }: AuctionFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="search">Buscar por nome</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nome do produto..."
            value={filters.name || ""}
            onChange={(e) => onFilterChange("name", e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) => onFilterChange("category", value === "all" ? "" : value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condição</Label>
        <Select
          value={filters.condition || "all"}
          onValueChange={(value) => onFilterChange("condition", value === "all" ? "" : value)}
        >
          <SelectTrigger id="condition">
            <SelectValue placeholder="Todas as condições" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as condições</SelectItem>
            {Object.entries(conditionLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
