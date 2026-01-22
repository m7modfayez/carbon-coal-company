import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/storage";

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Fetch all products
 */
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fetch products: ${errorMessage}` }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // -------- Validation --------
    if (!data.title || typeof data.title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (data.price === undefined || isNaN(Number(data.price))) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.image_urls) || data.image_urls.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // -------- Normalize payload --------
    const productData = {
      title: data.title,
      description: data.description ?? "",
      price: Number(data.price),
      image_urls: data.image_urls,
      specs: Array.isArray(data.specs) ? data.specs : [],
    };

    const product = await addProduct(productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      {
        error: `Failed to create product: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products?id=UUID
 * Update existing product
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Optional validation (only if fields exist)
    if (
      data.image_urls &&
      (!Array.isArray(data.image_urls) || data.image_urls.length === 0)
    ) {
      return NextResponse.json(
        { error: "image_urls must be a non-empty array" },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, {
      title: data.title,
      description: data.description,
      price: data.price !== undefined ? Number(data.price) : undefined,
      image_urls: data.image_urls,
      specs: Array.isArray(data.specs) ? data.specs : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update product: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products?id=UUID
 * Delete product
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteProduct(id);

    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete product: ${errorMessage}` },
      { status: 500 }
    );
  }
}
