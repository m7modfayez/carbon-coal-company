"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadProductImage } from "@/lib/storage";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, "الاسم مطلوب"),
  description: z.string().optional(),
  price: z.string().min(1, "السعر مطلوب"),
  specs: z
    .array(z.object({ value: z.string() }))
    .min(1, "أضف ميزة واحدة على الأقل"),
});

type ProductFormData = z.infer<typeof formSchema>;

// Helper to normalize image_urls from database (could be array or JSON string)
const normalizeImageUrls = (images: any): string[] => {
  if (Array.isArray(images)) {
    return images;
  }
  if (typeof images === "string" && images.startsWith("[")) {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export default function ProductForm({
  onSubmit,
  isLoading,
  initialData,
  isEditMode,
}: any) {
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    normalizeImageUrls(initialData?.image_urls || initialData?.image_url || [])
  );
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          specs: initialData.specs?.map((s: string) => ({ value: s })) || [
            { value: "" },
          ],
        }
      : {
          title: "",
          description: "",
          price: "",
          specs: [{ value: "" }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specs",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onFormSubmit = async (values: ProductFormData) => {
    try {
      setIsUploading(true);

      // Validate that we have at least one image
      const totalImages = existingImageUrls.length + selectedFiles.length;
      if (totalImages === 0) {
        if (toast.error) {
          toast.error("يجب إضافة صورة واحدة على الأقل");
        }
        setIsUploading(false);
        return;
      }

      let finalImageUrls: string[] = [...existingImageUrls];

      // Upload only new selected files
      for (const file of selectedFiles) {
        const uploadedUrl = await uploadProductImage(file);
        if (uploadedUrl) {
          finalImageUrls.push(uploadedUrl);
        }
      }

      const formattedData = {
        ...values,
        image_urls: finalImageUrls,
        specs: values.specs.map((s) => s.value).filter((s) => s.trim() !== ""),
      };

      await onSubmit(formattedData);

      // Reset form after successful submission
      setExistingImageUrls([]);
      setNewImagePreviews([]);
      setSelectedFiles([]);
    } catch (err) {
      console.error("Form submission error:", err);
      if (toast.error) {
        toast.error("حدث خطأ ما");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="flex flex-col h-full max-w-2xl mx-auto"
      >
        {/* SCROLLABLE AREA: max-h-[60vh] ensures it fits nicely in dialogs */}
        <div className="flex-1 overflow-y-auto pr-2 pl-4 py-2 space-y-6 max-h-[65vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Section */}
            <div className="md:col-span-5">
              <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block text-right">
                صور المنتج
              </FormLabel>

              {/* Upload Area */}
              <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden group mb-4">
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">اختر صور</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Images Grid - Existing Images */}
              {existingImageUrls.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 text-right">
                    الصور الموجودة
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {existingImageUrls.map((preview, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={preview}
                          alt={`Existing ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute top-1 right-1 p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Grid - New Images */}
              {newImagePreviews.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 text-right">
                    صور جديدة
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {newImagePreviews.map((preview, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={preview}
                          alt={`New ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute top-1 right-1 p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="md:col-span-7 space-y-4 text-right">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      اسم المنتج
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 text-base"
                        placeholder="مثال: فحم برتقال نخب أول"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      السعر (ج.م)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="h-11 text-base"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-sm font-semibold text-gray-700">
                  الوصف
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    className="text-base min-h-[100px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Specs Section - This grows as you add items */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-right">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-bold text-gray-800">
                المواصفات
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="h-9 px-4 text-sm font-medium text-teal-700 border-teal-200 hover:bg-teal-50"
              >
                <Plus className="w-4 h-4 ml-1.5" /> إضافة ميزة
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-start animate-in fade-in slide-in-from-top-1"
                >
                  <FormField
                    control={form.control}
                    name={`specs.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 text-sm bg-white border-gray-200"
                            placeholder={`أدخل ميزة المنتج...`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STICKY FOOTER: Stays visible at the bottom of the dialog */}
        <div className="pt-6 mt-4 border-t border-gray-100">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full bg-teal-700 hover:bg-teal-800 h-12 text-base font-bold rounded-xl shadow-lg shadow-teal-700/10"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEditMode ? (
              "حفظ التغييرات"
            ) : (
              "إضافة المنتج"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
