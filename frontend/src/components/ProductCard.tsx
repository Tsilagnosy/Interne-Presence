type ProductProps = {
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    vendor_name?: string;
    category_name?: string;
    city?: string;
    country?: string;
  };
};

export default function ProductCard({
  product,
}: ProductProps) {

    return (

        <div className="border rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80">

            <h2 className="text-xl font-semibold text-slate-900">
                {product.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
                {product.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                {product.vendor_name ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        Vendeur : {product.vendor_name}
                    </span>
                ) : null}
                {product.category_name ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        Catégorie : {product.category_name}
                    </span>
                ) : null}
                {product.city ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        Ville : {product.city}
                    </span>
                ) : null}
                {product.country ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        Pays : {product.country}
                    </span>
                ) : null}
            </div>

            <p className="mt-5 text-2xl font-bold text-slate-900">
                ${product.price}
            </p>

        </div>
    );
}	
	
	
	
	
	
	
	
	
	
	