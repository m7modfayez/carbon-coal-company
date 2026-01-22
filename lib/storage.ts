import { createClient } from "@supabase/supabase-js";
import { supabaseBrowser } from "./supabase";
import { ProductInsert } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {APP_ID} from "./app-config";


/**
 * Creates a server-only Supabase client with service role
 * ONLY call this in API routes or server components
 */
function getServerClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/* -------------------- Client-safe upload -------------------- */
export async function uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  // const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabaseBrowser.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabaseBrowser.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/* -------------------- Server-only CRUD -------------------- */
export async function getProducts() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*").eq("app_id", APP_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("app_id", APP_ID)
    .single();
  if (error) return null;
  return data;
}

export async function addProduct(product: ProductInsert) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      app_id: APP_ID,
      })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<ProductInsert>
) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("app_id", APP_ID)
    .select()
    .single();
  if (error) return null;
  return data;
}
export async function deleteProduct(id: string) {
  const supabase = getServerClient();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", id)
    .eq("app_id", APP_ID)
    .single();

  if (fetchError) return false;
  if (!product) return false;

  if (product.image_urls?.length > 0) {
    const filePaths: string[] = [];

    for (const url of product.image_urls) {
      try {
        const urlObj = new URL(url);

        const pathSegments = urlObj.pathname.split("/");

        const productImagesIndex = pathSegments.indexOf("product-images");

        if (productImagesIndex !== -1) {
          const relativePath = pathSegments
            .slice(productImagesIndex + 1)
            .join("/");
          filePaths.push(relativePath);

          console.log(`Extracted path from URL ${url}: ${relativePath}`);
        } else {
          console.warn(`Could not find "product-images" in URL: ${url}`);
        }
      } catch (error) {
        console.error(`Error parsing URL ${url}:`, error);
      }
    }

    if (filePaths.length > 0) {
      try {
        const { data: deleteData, error: deleteError } = await supabase.storage
          .from("product-images")
          .remove(filePaths);

        if (deleteError) {
          console.error("Error deleting images:", deleteError);
        } else {
          console.log("Successfully deleted images:", deleteData);
        }
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
      }
    }
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  return !error;
}
