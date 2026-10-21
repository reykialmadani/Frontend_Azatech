"use client";

import { Archive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct } from "@/hooks/use-products";
import { errorMessage } from "@/lib/api/form-errors";
import type { Product } from "@/types/product";

interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDeleteDialog({ product, open, onOpenChange }: ProductDeleteDialogProps) {
  const deleteMutation = useDeleteProduct();

  const onConfirm = () => {
    if (!product) return;
    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        toast.success(`Produk ${product.product_code} telah diarsipkan`);
        onOpenChange(false);
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-lg shadow-none">
        <AlertDialogHeader>
          <AlertDialogMedia className="border border-red-200 bg-red-50 text-red-600">
            <Archive />
          </AlertDialogMedia>
          <AlertDialogTitle>Arsipkan produk ini?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-zinc-900">
              {product?.product_name} ({product?.product_code})
            </span>{" "}
            akan disembunyikan dari katalog. Riwayat transaksi yang memakai produk ini tetap utuh.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md">Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleteMutation.isPending}
            className="rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {deleteMutation.isPending && <Loader2 className="animate-spin" />}
            Ya, Arsipkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
