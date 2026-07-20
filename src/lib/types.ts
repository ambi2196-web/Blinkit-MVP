export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  size: string;
  category: string;
  subcategory: string;
  tags: string[];
  delivery_min: number;
  img: string;
}

export interface CategoryTile {
  label: string;
  emoji: string;
  category: string;
  subcategory?: string;
}
