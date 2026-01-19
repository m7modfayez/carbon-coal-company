"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("Invalid product id");

        const res = await fetch(`/api/products/${id}`);
        if (res.status === 404) {
          setError("المنتج غير موجود");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-[500px] rounded-xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section className="py-20 px-4 text-center">
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/products")}>
            العودة للمنتجات
          </Button>
        </section>
        <Footer />
      </div>
    );
  }

  const images = product.image_urls;

  //whats app link for details.
  const openWhatsApp = () => {
    const phone = "201285279824";
  
    const message = `السلام عليكم، عايز تفاصيل عن ${product.title} بسعر ${product.price} جنيه 👋

    ${window.location.href}
    `;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };


  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
          <button
            onClick={() => router.push("/products")}
            className="mb-8 text-teal-700 font-semibold"
          >
            ← العودة للمنتجات
          </button>

          <div className="grid grid-cols-1 gap-12">
            {/* Images */}
            <div className="flex flex-col gap-4">
              <div className="relative h-[500px] rounded-xl bg-gray-100 overflow-hidden">
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImage((i) =>
                          i === 0 ? images.length - 1 : i - 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                    >
                      <ChevronRight />
                    </button>

                    <button
                      onClick={() =>
                        setActiveImage((i) =>
                          i === images.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                    >
                      <ChevronLeft />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img: any, i: any) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        i === activeImage
                          ? "border-teal-700"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-right">
              <h1 className="text-5xl font-bold mb-6">{product.title}</h1>

              <p className="text-4xl font-bold text-teal-700 mb-8">
                {product.price.toFixed(2)} ج.م
              </p>

              {product.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">الوصف</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.specs.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold mb-3">المواصفات</h2>
                  <ul className="space-y-2">
                    {product.specs.map((s: any, i: any) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-700 rounded-full" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

             <button
               onClick={openWhatsApp}
               className="block w-full bg-teal-700 text-white py-4 rounded-lg text-lg text-center hover:bg-teal-800"
             >
               استفسر الآن
             </button>
             
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
