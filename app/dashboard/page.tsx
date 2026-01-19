"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { getFirstImage } from "@/lib/utils";
import { Product } from "@/types";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      toast.error("فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProducts((p) => p.filter((x) => x.id !== id));
      toast.success("تم الحذف بنجاح");
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
            <p className="text-sm text-gray-500">عرض وتعديل المنتجات</p>
          </div>

        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="بحث..."
                className="pr-10 h-10 border rounded-lg px-3 w-full sm:w-auto"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> إضافة
            </Button>
          </div>
        </div>

        <Card>
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-4">المنتج</th>
                <th className="p-4">السعر</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center">
                    جاري التحميل...
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const image = getFirstImage(product);

                  return (
                    <tr key={product.id} className="border-b">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                          {image ? (
                            <img
                              src={image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-full h-full p-2 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{product.title}</div>
                          <div className="text-xs text-gray-500">
                            {product.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{product.price} ج.م</td>
                      <td className="p-4 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>

        {/* Add product form*/}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>إضافة منتج</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={async (data: any) => {
                try {
                  const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) {
                    const errorData = await res.json();
                    toast.error(errorData.error || "فشل إضافة المنتج");
                    return;
                  }
                  toast.success("تم إضافة المنتج بنجاح");
                  setIsAddOpen(false);
                  fetchProducts();
                } catch (error) {
                  console.error("Add product error:", error);
                  toast.error("حدث خطأ ما");
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Edit */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>تعديل المنتج</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm
                isEditMode
                initialData={editingProduct}
                onSubmit={async (data: any) => {
                  try {
                    const res = await fetch(`/api/products?id=${editingProduct.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    });
                    if (!res.ok) {
                      const errorData = await res.json();
                      toast.error(errorData.error || "فشل تعديل المنتج");
                      return;
                    }
                    toast.success("تم تعديل المنتج بنجاح");
                    setIsEditOpen(false);
                    setEditingProduct(null);
                    fetchProducts();
                  } catch (error) {
                    console.error("Edit product error:", error);
                    toast.error("حدث خطأ ما");
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
         <DialogContent className="w-[95vw] max-w-md pt-10">
           <DialogHeader>
             <DialogTitle className="text-right">
               تأكيد الحذف
             </DialogTitle>
           </DialogHeader>
       
          <p className="text-sm text-gray-600 text-right leading-relaxed">
            هل أنت متأكد إنك عايز تحذف المنتج؟
          </p>
          
          {/* <p className="text-sm font-bold text-right mt-2 text-gray-900">
            {deleteTarget?.title}
          </p> */}
       
           <div className="flex gap-2 mt-6">
             <Button
               variant="outline"
               className="flex-1"
               onClick={() => setDeleteTarget(null)}
             >
               إلغاء
             </Button>
       
             <Button
               variant="destructive"
               className="flex-1"
               onClick={() => {
                 handleDelete(deleteTarget!.id);
                 setDeleteTarget(null);
               }}
             >
               حذف
             </Button>
           </div>
         </DialogContent>
       </Dialog>

      </main>
    </div>
  );
}
