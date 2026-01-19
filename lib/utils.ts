import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Always returns the first product image or undefined
 */
export const getFirstImage = (product: {
  image_urls?: string[];
}): string | undefined => {
  return product.image_urls?.[0];
};

/**
 * Ensures product always has image_urls + specs arrays
 * Prevents UI crashes
 */
export const normalizeProduct = <T extends object>(
  product: T & {
    image_urls?: string[] | null;
    specs?: string[] | null;
  }
): T & {
  image_urls: string[];
  specs: string[];
} => {
  return {
    ...product,
    image_urls: Array.isArray(product.image_urls) ? product.image_urls : [],
    specs: Array.isArray(product.specs) ? product.specs : [],
  };
};
