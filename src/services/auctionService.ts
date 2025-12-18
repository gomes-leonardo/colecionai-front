import { api } from "@/lib/axios";
import { Auction, CreateAuctionData, UpdateAuctionData, AuctionFilters, AuctionDetails } from "@/types/auction";

export async function createAuction(data: CreateAuctionData): Promise<Auction> {
  try {
    const response = await api.post<Auction>("/auctions", data);
    return response.data;
  } catch (error: any) {
    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        // Validation error - check for Zod issues
        if (data.issues) {
          throw new Error(data.issues.map((issue: any) => issue.message).join(", "));
        }
        throw new Error(data.message || "Erro de validação ao criar leilão");
      }

      if (status === 403) {
        throw new Error("Você não tem permissão para criar leilão para esse produto");
      }

      if (status === 404) {
        throw new Error("Produto não encontrado");
      }
    }

    throw new Error("Erro ao criar leilão. Tente novamente.");
  }
}

export async function getAuctions(filters?: AuctionFilters): Promise<Auction[]> {
  try {
    const params: any = {
      page: filters?.page || 1,
      per_page: filters?.per_page || 10,
    };

    if (filters?.name) {
      params.name = filters.name;
    }

    if (filters?.category) {
      params.category = filters.category;
    }

    if (filters?.condition) {
      params.condition = filters.condition;
    }

    const response = await api.get<Auction[]>("/auctions", { params });

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Handle wrapped response
    if (response.data && Array.isArray((response.data as any).auctions)) {
      return (response.data as any).auctions;
    }

    if (response.data && Array.isArray((response.data as any).data)) {
      return (response.data as any).data;
    }

    console.warn("getAuctions received unexpected format:", response.data);
    return [];
  } catch (error: any) {
    console.error("Error fetching auctions:", error);
    throw new Error("Erro ao carregar leilões. Tente novamente.");
  }
}

export async function getAuctionById(id: string): Promise<Auction> {
  try {
    const response = await api.get<Auction>(`/auctions/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Leilão não encontrado");
    }
    throw new Error("Erro ao carregar leilão. Tente novamente.");
  }
}

/**
 * Get detailed auction information including bids
 */
export async function getAuctionDetails(id: string): Promise<AuctionDetails> {
  try {
    const response = await api.get<AuctionDetails>(`/auctions/details/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Leilão não encontrado");
    }
    throw new Error("Erro ao carregar detalhes do leilão. Tente novamente.");
  }
}

/**
 * Get user's own auctions
 */
export async function getMyAuctions(userId: string, filters?: AuctionFilters): Promise<Auction[]> {
  try {
    const params: any = {
      user_id: userId,
      page: filters?.page || 1,
      per_page: filters?.per_page || 10,
    };

    if (filters?.name) {
      params.name = filters.name;
    }

    if (filters?.category) {
      params.category = filters.category;
    }

    if (filters?.condition) {
      params.condition = filters.condition;
    }

    const response = await api.get<Auction[]>("/auctions/me", { params });
    
    // Handle direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Handle wrapped response
    if (response.data && Array.isArray((response.data as any).auctions)) {
      return (response.data as any).auctions;
    }

    if (response.data && Array.isArray((response.data as any).data)) {
      return (response.data as any).data;
    }

    return [];
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Você precisa estar autenticado para ver seus leilões');
    }
    
    console.error("Error fetching my auctions:", error);
    throw new Error('Erro ao buscar seus leilões');
  }
}

/**
 * Update an auction
 */
export async function updateAuction(auctionId: string, data: UpdateAuctionData): Promise<Auction> {
  try {
    const response = await api.put<Auction>(`/auctions/${auctionId}`, data);
    return response.data;
  } catch (error: any) {
    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 400) {
        // Validation error - check for Zod issues
        if (responseData.issues) {
          throw new Error(responseData.issues.map((issue: any) => issue.message).join(", "));
        }
        throw new Error(responseData.message || "Erro de validação ao atualizar leilão");
      }

      if (status === 403) {
        // Permission denied - could be due to bids or not being the owner
        const message = responseData.message || 'Você não tem permissão para editar este leilão';
        throw new Error(message);
      }

      if (status === 404) {
        throw new Error("Leilão não encontrado");
      }
    }

    throw new Error("Erro ao atualizar leilão. Tente novamente.");
  }
}

/**
 * Delete an auction
 */
export async function deleteAuction(auctionId: string): Promise<void> {
  try {
    await api.delete(`/auctions/${auctionId}`);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 403) {
        // Permission denied - could be due to bids or not being the owner
        const message = responseData.message || 'Você não tem permissão para excluir este leilão';
        throw new Error(message);
      }
      
      if (status === 404) {
        throw new Error('Leilão não encontrado');
      }

      throw new Error(responseData.message || 'Erro ao excluir leilão');
    }
    
    throw new Error('Erro ao excluir leilão');
  }
}

/**
 * Cancel an auction (changes status to CANCELLED)
 * Only works if there are no bids
 */
export async function cancelAuction(auctionId: string): Promise<Auction> {
  try {
    // Use updateAuction to set status to CANCELLED
    const response = await api.put<Auction>(`/auctions/${auctionId}`, {
      status: 'CANCELLED'
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 400) {
        // Validation error - probably has bids
        throw new Error(responseData.message || 'Não é possível cancelar leilão com lances');
      }

      if (status === 403) {
        throw new Error('Você não tem permissão para cancelar este leilão');
      }
      
      if (status === 404) {
        throw new Error('Leilão não encontrado');
      }

      throw new Error(responseData.message || 'Erro ao cancelar leilão');
    }
    
    throw new Error('Erro ao cancelar leilão');
  }
}
