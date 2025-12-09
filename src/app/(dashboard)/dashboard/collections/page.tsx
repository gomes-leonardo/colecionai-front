'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Gamepad2, BookOpen, Disc, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock Collections Data
const collections = [
  {
    id: 1,
    name: "Retro Gaming",
    icon: Gamepad2,
    itemCount: 12,
    value: 3500.00,
    color: "bg-purple-500/20 text-purple-500",
    description: "Minha coleção de consoles e jogos clássicos.",
  },
  {
    id: 2,
    name: "HQs Marvel",
    icon: BookOpen,
    itemCount: 45,
    value: 1200.00,
    color: "bg-red-500/20 text-red-500",
    description: "Quadrinhos da Era de Prata e Bronze.",
  },
  {
    id: 3,
    name: "Vinis Raros",
    icon: Disc,
    itemCount: 8,
    value: 800.00,
    color: "bg-amber-500/20 text-amber-500",
    description: "Álbuns de rock progressivo dos anos 70.",
  },
];

export default function CollectionsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Coleções</h1>
          <p className="text-muted-foreground">Organize seus itens por categorias.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nova Coleção
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card (Visual Placeholder) */}
        <button className="h-full min-h-[200px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all group bg-card/50 hover:bg-card">
          <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-medium">Criar Nova Coleção</span>
        </button>

        {collections.map((collection) => (
          <Card key={collection.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-pointer">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className={`p-3 rounded-lg ${collection.color} transition-colors`}>
                <collection.icon className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                {collection.itemCount} itens
              </Badge>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {collection.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {collection.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valor Estimado:</span>
                <span className="font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(collection.value)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
