import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Gavel, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    type: 'sale' | 'auction';
    seller: {
        name: string;
        rating: number;
    };
    auction?: {
        endsAt: Date;
        bids: number;
    };
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const isAuction = product.type === 'auction';

    return (
        <Link href={`/products/${product.id}`}>
            <Card className="border-border bg-card overflow-hidden hover:border-primary/50 transition-all group relative cursor-pointer h-full flex flex-col">
                {/* Image Area */}
                <div className="relative aspect-square bg-muted flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="text-4xl font-bold text-muted-foreground select-none">IMG</div>

                    {/* Overlay Tags */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground px-2 py-1 rounded-full border border-border">
                            {product.category}
                        </span>
                    </div>

                    {isAuction && (
                        <div className="absolute bottom-3 right-3 bg-accent/90 backdrop-blur-sm text-accent-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-black/10">
                            <Clock className="w-3 h-3" /> 2h 15m
                        </div>
                    )}
                </div>

                <CardHeader className="p-4 pb-2 space-y-1">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center border border-border">
                            <User className="w-3 h-3" />
                        </div>
                        <span className="truncate max-w-[120px]">@{product.seller.name}</span>
                    </div>

                    <h3 className="text-base font-semibold text-card-foreground line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </CardHeader>

                <CardContent className="p-4 pt-0 mt-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">
                                {isAuction ? 'Lance Atual' : 'Preço'}
                            </p>
                            <p className={cn("text-lg font-bold", isAuction ? "text-accent" : "text-primary")}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </p>
                        </div>
                        {isAuction && (
                            <div className="text-xs text-muted-foreground text-right">
                                <p>{product.auction?.bids} lances</p>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    <Button
                        asChild
                        className={cn(
                            "w-full transition-all duration-300",
                            isAuction
                                ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        )}
                    >
                        <span>
                            {isAuction ? (
                                <><Gavel className="w-4 h-4 mr-2" /> Dar Lance</>
                            ) : (
                                'Comprar'
                            )}
                        </span>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
