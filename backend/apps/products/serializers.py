from rest_framework import serializers

from .models import (
    Category,
    Product,
    ProductImage
)


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):

    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    vendor_name = serializers.CharField(
        source='vendor.store_name',
        read_only=True
    )

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Product

        fields = [
            'id',
            'vendor',
            'vendor_name',
            'category',
            'category_name',
            'name',
            'slug',
            'description',
            'product_type',
            'stock_quantity',
            'price',
            'discount_price',
            'minimum_bulk_quantity',
            'city',
            'country',
            'delivery_time',
            'is_active',
            'images',
            'created_at',
        ]

        read_only_fields = ['vendor']	
	
	
	
	
	
	
	