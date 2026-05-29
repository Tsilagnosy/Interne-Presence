from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import (
    Order,
    OrderItem,
    Cart,
    CartItem,
)

from apps.payments.models import PaymentTransaction
from apps.products.models import Product

import uuid
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
)


class DeliveryMethodsView(APIView):
    """Retourne les méthodes de livraison disponibles"""
    permission_classes = [AllowAny]

    def get(self, request):
        delivery_methods = [
            {
                'id': 'standard',
                'name': 'Standard (5-7 jours)',
                'price': 0,
                'description': 'Livraison standard'
            },
            {
                'id': 'express',
                'name': 'Express (2-3 jours)',
                'price': 5.00,
                'description': 'Livraison express'
            },
            {
                'id': 'overnight',
                'name': 'Overnight (1 jour)',
                'price': 15.00,
                'description': 'Livraison le lendemain'
            }
        ]
        return Response(delivery_methods)


class PaymentMethodsView(APIView):
    """Retourne les méthodes de paiement disponibles"""

    permission_classes = [AllowAny]

    def get(self, request):
        methods = []
        for key, label in Order.PAYMENT_METHOD_CHOICES:
            methods.append({'id': key, 'label': label})
        return Response(methods)


class MyCartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )
        return cart	
	
class AddToCartView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(
            user=self.request.user
        )
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(
            cart=cart,
            product=product
        )


class GuestCartCreateView(APIView):
    """Crée un panier pour un visiteur et renvoie un token"""

    permission_classes = [AllowAny]

    def post(self, request):
        token = uuid.uuid4().hex
        cart = Cart.objects.create(guest_token=token)
        return Response({'guest_token': token, 'cart_id': cart.id})


class GuestAddToCartView(APIView):
    """Ajoute un item au panier invité via token"""

    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('guest_token')
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not token or not product_id:
            return Response({'error': 'guest_token and product_id are required'}, status=400)

        cart = get_object_or_404(Cart, guest_token=token)
        product = get_object_or_404(Product, id=product_id)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        return Response({
            'message': 'Item ajouté au panier invité',
            'item_id': item.id,
            'quantity': item.quantity,
        })


class GuestCartView(APIView):
    """Récupère le panier invité par token"""

    permission_classes = [AllowAny]

    def get(self, request, token):
        cart = get_object_or_404(Cart, guest_token=token)
        return Response(CartSerializer(cart).data)
	
class RemoveCartItemView(generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__user=self.request.user
        ).select_related('product', 'cart')
	
class CheckoutView(APIView):
    """Checkout amélioré avec support pour les utilisateurs authentifiés et invités"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Récupérer les données de la requête
            cart_items_data = request.data.get('cart_items', [])
            shipping_address = request.data.get('shipping_address')
            city = request.data.get('city')
            country = request.data.get('country')
            phone_number = request.data.get('phone_number')
            delivery_method = request.data.get('delivery_method', 'standard')
            payment_method = request.data.get('payment_method')
            
            # Informations optionnelles pour les guests
            guest_email = request.data.get('guest_email')
            guest_name = request.data.get('guest_name')

            # Validation
            if not cart_items_data:
                return Response(
                    {'error': 'Le panier est vide'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not all([shipping_address, city, country, phone_number]):
                return Response(
                    {'error': 'Informations de livraison incomplètes'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not payment_method:
                return Response(
                    {'error': 'Veuillez choisir une méthode de paiement'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Si c'est un utilisateur authentifié
            if request.user.is_authenticated:
                cart, _ = Cart.objects.get_or_create(user=request.user)
                cart_items = cart.items.all()
                customer = request.user
                order_email = request.user.email
            else:
                # Pour les guests
                # Support token-based guest cart
                guest_token = request.data.get('guest_cart_token')

                if guest_token:
                    cart = get_object_or_404(Cart, guest_token=guest_token)
                    cart_items = list(cart.items.all())
                else:
                    cart_items = []

                if not guest_email and not cart_items:
                    return Response(
                        {'error': 'Email requis pour les visiteurs'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                customer = None
                order_email = guest_email

            if (hasattr(cart_items, 'exists') and not cart_items.exists()) or (isinstance(cart_items, list) and len(cart_items) == 0):
                # Créer les items à partir des données envoyées
                cart_items = []
                for item_data in cart_items_data:
                    product_id = item_data.get('product_id')
                    quantity = item_data.get('quantity', 1)
                    if not product_id or not quantity:
                        return Response(
                            {'error': 'Données d\'article invalides'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    product = get_object_or_404(Product, id=product_id)
                    cart_items.append({
                        'product': product,
                        'quantity': quantity
                    })

            # Récupérer le premier produit pour le vendor
            if request.user.is_authenticated:
                first_product = cart_items.first().product
            else:
                first_product = cart_items[0]['product']
            
            vendor = first_product.vendor

            # Calculer le prix total
            total_price = 0
            if request.user.is_authenticated:
                for item in cart_items:
                    total_price += item.product.price * item.quantity
            else:
                for item in cart_items:
                    total_price += item['product'].price * item['quantity']

            # Créer la commande
            order = Order.objects.create(
                customer=customer,
                guest_email=guest_email if not request.user.is_authenticated else None,
                guest_name=guest_name if not request.user.is_authenticated else None,
                vendor=vendor,
                total_price=total_price,
                shipping_address=shipping_address,
                city=city,
                country=country,
                phone_number=phone_number,
                delivery_method=delivery_method,
                payment_method=payment_method,
                status='pending'
            )

            # Créer les items de la commande
            if request.user.is_authenticated:
                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price=item.product.price
                    )
                    item.product.stock_quantity -= item.quantity
                    item.product.save()
                cart.items.all().delete()
            else:
                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item['product'],
                        quantity=item['quantity'],
                        price=item['product'].price
                    )
                    item['product'].stock_quantity -= item['quantity']
                    item['product'].save()

            # Créer la transaction de paiement
            payment = PaymentTransaction.objects.create(
                order=order,
                payment_method=payment_method,
                transaction_id=str(uuid.uuid4()),
                amount=total_price,
                status='pending'
            )

            return Response(
                {
                    'message': 'Commande créée avec succès',
                    'order': OrderSerializer(order).data,
                    'payment': {
                        'transaction_id': payment.transaction_id,
                        'amount': str(payment.amount),
                        'payment_method': payment.payment_method
                    }
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
	
	
	
	
	
	
	
	
	
		
	
	
	
	
	
	

	
	
	
	
	
	
	
	
		
	
	
	
	
	
	
	
	
	
	
	
	
	
