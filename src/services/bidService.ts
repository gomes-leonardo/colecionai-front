import { api } from "@/lib/axios";
import { CreateBidData, BidResponse, Bid } from "@/types/auction";
import { AuctionDetails } from "@/types/auction";

export interface UserBid {
  id: string;
  amount: string;
  auction_id: string;
  created_at: string;
  auction: {
    id: string;
    product: {
      name: string;
      description: string;
      images: Array<{ url: string }>;
    };
    start_price: string;
    status: string;
    end_date: string;
    created_at: string;
    bids?: Bid[];
    _count?: {
      bids: number;
    };
  };
}

/**
 * Create a new bid on an auction
 */
export async function createBid(data: CreateBidData): Promise<BidResponse> {
  try {
    const response = await api.post<BidResponse>("/bids", data);
    return response.data;
  } catch (error: any) {
    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 400) {
        // Validation error
        if (responseData.issues) {
          throw new Error(responseData.issues.map((issue: any) => issue.message).join(", "));
        }
        throw new Error(responseData.message || "Erro de validação ao criar lance");
      }

      if (status === 403) {
        // Permission denied - could be own auction, auction ended, or bid too low
        const message = responseData.message || 'Você não tem permissão para dar lance neste leilão';
        throw new Error(message);
      }

      if (status === 404) {
        throw new Error("Leilão não encontrado");
      }

      if (status === 401) {
        throw new Error("Você precisa estar autenticado para dar lances");
      }
    }

    throw new Error("Erro ao criar lance. Tente novamente.");
  }
}

/**
 * Get user's bids
 */
export async function getMyBids(): Promise<UserBid[]> {
  try {
    const response = await api.get<UserBid[]>("/bids/me");
    
    // Handle direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Handle wrapped response
    if (response.data && Array.isArray((response.data as any).bids)) {
      return (response.data as any).bids;
    }

    if (response.data && Array.isArray((response.data as any).data)) {
      return (response.data as any).data;
    }

    return [];
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Você precisa estar autenticado para ver seus lances');
    }
    
    console.error("Error fetching my bids:", error);
    throw new Error('Erro ao buscar seus lances');
  }
}
