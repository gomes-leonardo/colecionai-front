import { z } from "zod";

export const createAuctionSchema = z.object({
  product_id: z.string().uuid({
    message: "ID do produto inválido"
  }),
  start_price: z.number().positive({
    message: "O preço inicial deve ser maior que zero"
  }),
});

export type CreateAuctionFormData = z.infer<typeof createAuctionSchema>;
