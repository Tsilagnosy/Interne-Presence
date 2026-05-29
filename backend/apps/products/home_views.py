from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from .models import Product
from apps.vendors.models import Vendor


class HomePageView(APIView):
    """
    Vue pour la page d'accueil qui retourne:
    - Statistiques générales
    - Produits en vedette
    - Vendeurs populaires
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Statistiques générales
        total_products = Product.objects.filter(is_active=True).count()
        total_vendors = Vendor.objects.filter(is_active=True).count()
        total_categories = Product.objects.filter(is_active=True).values('category').distinct().count()
        
        # Produits en vedette (les plus récents et actifs)
        featured_products = Product.objects.filter(
            is_active=True
        ).select_related('vendor', 'category').order_by('-created_at')[:8]
        
        # Vendeurs populaires (avec le plus de produits)
        popular_vendors = Vendor.objects.filter(
            is_active=True
        ).annotate(
            product_count=Count('products', filter=Q(products__is_active=True))
        ).order_by('-product_count')[:6]
        
        # Sérialiser les données
        from .serializers import ProductSerializer
        from apps.vendors.serializers import VendorSerializer
        
        featured_products_data = ProductSerializer(featured_products, many=True).data
        popular_vendors_data = VendorSerializer(popular_vendors, many=True).data
        
        return Response({
            'statistics': {
                'total_products': total_products,
                'total_vendors': total_vendors,
                'total_categories': total_categories,
            },
            'featured_products': featured_products_data,
            'popular_vendors': popular_vendors_data,
        })
