export enum ProductCondition {
  NEW = "NEW",
  USED = "USED",
  OPEN_BOX = "OPEN_BOX"
}

export enum ProductCategory {
  ACTION_FIGURES = "ACTION_FIGURES",
  COLLECTIBLE_STATUES = "COLLECTIBLE_STATUES",
  FUNKO_POP = "FUNKO_POP",
  TRADING_CARDS = "TRADING_CARDS",
  COMIC_BOOKS = "COMIC_BOOKS",
  MANGA = "MANGA",
  RETRO_GAMES = "RETRO_GAMES",
  MINIATURES = "MINIATURES",
  MODEL_KITS = "MODEL_KITS",
  MOVIES_TV_COLLECTIBLES = "MOVIES_TV_COLLECTIBLES",
  ANIME_COLLECTIBLES = "ANIME_COLLECTIBLES",
  ART_BOOKS = "ART_BOOKS",
  RARE_COLLECTIBLES = "RARE_COLLECTIBLES"
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_verified?: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // Em centavos
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  user_id: string;
  authorName?: string;
  banner?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Export auction types
export * from './auction';