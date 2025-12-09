import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
      <Skeleton className="h-48 w-full bg-slate-800" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-slate-800" />
        <Skeleton className="h-4 w-1/2 bg-slate-800" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full bg-slate-800" />
      </CardFooter>
    </Card>
  )
}
