import type { CartItem } from '@/types';

type CartItemCardProps = {
  item: CartItem;
  onRemove: (id: number) => void;
};

export default function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const product = item.product_detail;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            {product.vendor_name ? <span className="rounded-full bg-slate-100 px-3 py-1">{product.vendor_name}</span> : null}
            {product.category_name ? <span className="rounded-full bg-slate-100 px-3 py-1">{product.category_name}</span> : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-lg font-semibold text-slate-900">${product.price}</p>
          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-700 transition hover:bg-rose-100"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
