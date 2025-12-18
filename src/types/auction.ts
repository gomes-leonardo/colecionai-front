import { Product } from "./index";

export enum AuctionStatus {
  OPEN = "OPEN",           // Mudado de ACTIVE para OPEN (backend usa OPEN)
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED"
}

export interface Auction {
  id: string;
  start_date: string; // ISO 8601 format
  end_date: string; // ISO 8601 format
  start_price: string; // Decimal string from API
  product_id: string;
  status: AuctionStatus; // Status do leilão
  product: {
    name: string;
    description: string;
    images: Array<{
      url: string;
    }>;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateAuctionData {
  product_id: string;
  start_price: number; // Number for form input
  start_date?: string; // ISO 8601 format - optional, auto-generated if not provided
  end_date?: string; // ISO 8601 format - optional, auto-generated if not provided
}

export interface UpdateAuctionData {
  product_id?: string;
  start_price?: number; // Number for form input
  start_date?: string; // ISO 8601 format
  end_date?: string; // ISO 8601 format
}

export interface AuctionFilters {
  name?: string;
  category?: string;
  condition?: string;
  page?: number;
  per_page?: number;
}

export interface AuctionProduct extends Product {
  type: 'auction';
  auction: {
    id: string;
    start_date: string;
    end_date: string;
    current_price: number;
    bids: number;
  };
}

export interface Bid {
  id: string;
  amount: string; // Decimal string from API
  user?: {
    id: string;
    name: string;
  };
  user_id?: string;
  created_at: string;
}

export interface AuctionDetails extends Auction {
  bids: Bid[];
  _count: {
    bids: number;
  };
  product: {
    name: string;
    description: string;
    images: Array<{
      url: string;
    }>;
    user: {
      id: string;
      name: string;
    };
  };
}

export interface CreateBidData {
  auction_id: string;
  amount: number;
}

export interface BidResponse {
  id: string;
  auction_id: string;
  user_id: string;
  amount: string;
  created_at: string;
  updated_at: string;
}
