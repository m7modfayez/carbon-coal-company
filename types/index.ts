export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  specs: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  title: string;
  description?: string;
  price: number;
  image_urls: string[];
  specs: string[];
}
