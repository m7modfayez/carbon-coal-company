"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls?: string[];
  image_url?: string;
  specs: string[];
  createdAt: string;
}

// Helper function to get the first image from either image_urls or image_url
const getFirstImage = (product: Product): string | undefined => {
  if (
    product.image_urls &&
    Array.isArray(product.image_urls) &&
    product.image_urls.length > 0
  ) {
    return product.image_urls[0];
  }
  if (product.image_url) {
    // Try to parse as JSON array if it's a string that looks like JSON
    try {
      if (
        typeof product.image_url === "string" &&
        product.image_url.startsWith("[")
      ) {
        const urls = JSON.parse(product.image_url);
        if (Array.isArray(urls) && urls.length > 0) {
          return urls[0];
        }
      } else {
        return product.image_url;
      }
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
};

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setError("حدث خطأ في تحميل المنتجات");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-1/2 mx-auto mb-4 bg-gray-200" />
            <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
          </div>
          <div className="h-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg"
              >
                <Skeleton className="h-64 w-full bg-gray-200" />
                <div className="p-8 space-y-4">
                  <Skeleton className="h-6 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-5/6 bg-gray-200" />
                  <Skeleton className="h-8 w-1/2 bg-gray-200" />
                  <Skeleton className="h-12 w-full bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } else if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">{error}</p>
        <Link
          href="/products"
          className="inline-block bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-800 transition-colors"
        >
          عرض جميع المنتجات
        </Link>
      </div>
    );
  }

  return (
    <section id="products" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            أنواع <span className="text-teal-700">الفحم</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نوفر أنواع مختلفة من الفحم عالي الجودة لتلبية احتياجاتك المختلفة
          </p>
        </div>

        <div className="h-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {products.slice(0, 3).map((product, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-64 bg-gradient-to-r from-teal-700 to-teal-900 flex items-center justify-center">
                {getFirstImage(product) ? (
                  <img
                    src={getFirstImage(product)}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-6xl">⬛</div>
                )}
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-teal-700">
                    {product.price.toFixed(2)}ج.م
                  </p>
                </div>

                {/* <div className="space-y-2">
                  {product.specs.map((spec, specIndex) => (
                    <div key={specIndex} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-700 rounded-full"></span>
                      <span className="text-sm text-gray-700">{spec}</span>
                    </div>
                  ))}
                </div> */}

                <button
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors text-center cursor-pointer"
                >
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Link */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-800 transition-colors"
          >
            عرض جميع المنتجات
          </Link>
        </div>
      </div>
    </section>
  );
}
