import { api } from "@/lib/axios";
import { Product, ProductCategory, ProductCondition } from "@/types";

export interface GetProductsFilters {
  name?: string;
  category?: string;
  condition?: string;
  page?: number;
}

export async function getProducts(filters: GetProductsFilters | number = 1): Promise<Product[]> {
  const page = typeof filters === 'number' ? filters : filters.page || 1;
  const queryParams = typeof filters === 'number' ? { page } : { ...filters, page };

  // Use 'any' for response to handle potential wrapper objects from backend
  const response = await api.get<any>("/products", {
    params: { 
      limit: 12,
      ...queryParams
    }
  });

  // Handle direct array response
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Handle paginated response { products: [...] } or { data: [...] }
  if (response.data && Array.isArray(response.data.products)) {
    return response.data.products;
  }

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  console.warn("getProducts received unexpected format:", response.data);
  return [];
}

export async function getMyProducts() {
  const response = await api.get<Product[]>(`/products/me`);
  return response.data;
}

export async function getProductById(id: string) {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
}

export interface CreateProductData {
  name: string;
  price: number; // Em centavos
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  image?: File;
}

export async function uploadProductImage(id: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.patch<Product>(`/products/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function createProduct(data: CreateProductData) {
  // 1. Create product with all fields except image
  const { image, ...productData } = data;
  
  const response = await api.post<Product>("/products", productData);
  const product = response.data;

  // 2. Upload image if present
  if (image) {
    return uploadProductImage(product.id, image);
  }

  return product;
}

export async function updateProduct(id: string, data: Partial<CreateProductData>) {
  const { image, ...productData } = data;
  const response = await api.put<Product>(`/products/${id}`, productData);
  
  if (image) {
    return uploadProductImage(id, image);
  }

  return response.data;
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`);
}

export function getProductImageUrl(imagePath: string | null | undefined) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  // A API retorna o caminho relativo, precisamos construir a URL completa
  const baseURL = api.defaults.baseURL || 'https://colecionai-api.onrender.com';
  return `${baseURL}/files/${imagePath}`;
}