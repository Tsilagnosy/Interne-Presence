'use client'

import { useEffect, useState } from "react";

import api from "@/services/api";

import ProductCard from "@/components/ProductCard";


export default function Home() {

    const [products, setProducts] = useState([]);


    useEffect(() => {

        fetchProducts();

    }, []);


    const fetchProducts = async () => {

        try {

            const response = await api.get(
                "products/"
            );

            setProducts(
                response.data.results
            );

        } catch (error) {

            console.log(error);
        }
    };


    return (

        <main className="
            min-h-screen
            p-10
        ">

            <h1 className="
                text-4xl
                font-bold
            ">

                AfriMarket

            </h1>

            <p className="mt-4 text-lg">

                Marketplace multi-vendeur Afrique

            </p>

            <div className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-6
                mt-10
            ">

                {products.map((product: any) => (

                    <ProductCard
                        key={product.id}
                        product={product}
                    />

                ))}

            </div>

        </main>
    );
}
	
	
	
	
	
	
	
	
	
	