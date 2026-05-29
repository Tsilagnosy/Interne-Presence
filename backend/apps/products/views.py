from rest_framework import generics
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)

from .models import Product
from .serializers import ProductSerializer
from .permissions import ( IsVendor, IsOwnerVendor )

from apps.vendors.models import Vendor


class ProductListView(generics.ListAPIView):

    queryset = Product.objects.filter(
        is_active=True
    ).select_related('vendor', 'category')

    serializer_class = ProductSerializer

    permission_classes = [AllowAny]

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'name',
        'description',
        'city',
        'country',
    ]

    ordering_fields = [
        'price',
        'created_at',
    ]
	

class ProductCreateView(generics.CreateAPIView):

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVendor
    ]

    def perform_create(self, serializer):

        vendor = get_object_or_404(
            Vendor,
            user=self.request.user
        )
        
        from rest_framework.exceptions import PermissionDenied

        if not vendor.has_active_subscription() and not self.request.user.is_superuser:
            raise PermissionDenied(
                'Vous devez avoir un abonnement actif pour publier des produits.'
            )

        serializer.save(vendor=vendor)


class ProductDetailView(generics.RetrieveAPIView):

    queryset = Product.objects.select_related('vendor', 'category')

    serializer_class = ProductSerializer

    permission_classes = [AllowAny]


class ProductUpdateView(generics.UpdateAPIView):

    queryset = Product.objects.select_related('vendor', 'category')

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVendor,
        IsOwnerVendor
    ]


class ProductDeleteView(generics.DestroyAPIView):

    queryset = Product.objects.select_related('vendor', 'category')

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVendor,
        IsOwnerVendor
    ]