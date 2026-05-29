from rest_framework import serializers

from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem
)

from apps.products.serializers import ProductSerializer


class CartItemSerializer(
    serializers.ModelSerializer
):

    product_detail = ProductSerializer(
        source='product',
        read_only=True
    )

    class Meta:
        model = CartItem

        fields = [
            'id',
            'product',
            'product_detail',
            'quantity',
        ]


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Cart

        fields = [
            'id',
            'items',
            'created_at',
        ]


class OrderItemSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = OrderItem

        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order

        fields = '__all__'
	
	
	
	
	
	
	
	
	
	