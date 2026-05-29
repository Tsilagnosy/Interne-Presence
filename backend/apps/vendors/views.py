from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)
from .models import Vendor, VendorSubscription
from .serializers import VendorSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.products.models import Product
from apps.products.serializers import ProductSerializer


class VendorListView(generics.ListAPIView):

    queryset = Vendor.objects.select_related('user').all()

    serializer_class = VendorSerializer

    permission_classes = [AllowAny]


class VendorDetailView(generics.RetrieveAPIView):

    queryset = Vendor.objects.select_related('user').all()

    serializer_class = VendorSerializer

    permission_classes = [AllowAny]


class MyVendorProfileView(
    generics.RetrieveAPIView
):

    serializer_class = VendorSerializer

    permission_classes = [IsAuthenticated]

    def get_object(self):

        return get_object_or_404(
            Vendor,
            user=self.request.user
        )


class MyVendorProductsView(
    generics.ListAPIView
):

    serializer_class = ProductSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        vendor = get_object_or_404(
            Vendor,
            user=self.request.user
        )

        return Product.objects.filter(
            vendor=vendor
        ).select_related('vendor', 'category')
	
class VendorDashboardStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        vendor = get_object_or_404(
            Vendor,
            user=request.user
        )

        products = Product.objects.filter(
            vendor=vendor
        )

        total_products = products.count()

        active_products = products.filter(
            is_active=True
        ).count()

        return Response({
            'total_products': total_products,
            'active_products': active_products,
        })


class VendorRegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = None

        from .serializers import VendorRegisterSerializer

        serializer = VendorRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=400)

        vendor = serializer.save()

        # if caller sets paid=True (trusted), activate subscription immediately
        if request.data.get('paid'):
            from django.utils import timezone
            from datetime import timedelta

            start = timezone.now()
            end = start + timedelta(days=180)

            VendorSubscription.objects.create(
                vendor=vendor,
                plan='basic',
                start_date=start,
                end_date=end,
                is_active=True
            )

            return Response({'message': 'Vendor created and subscription activated', 'vendor_id': vendor.id})

        return Response({'message': 'Vendor created. Subscription pending payment', 'vendor_id': vendor.id})


class VendorRenewSubscriptionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data
        vendor_id = data.get('vendor_id')

        try:
            vendor = Vendor.objects.get(id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)

        # Only vendor owner or superuser can renew
        if not (request.user.is_superuser or vendor.user == request.user):
            return Response({'error': 'Not allowed'}, status=403)

        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()

        # extend existing active subscription or create new one
        active = vendor.subscriptions.filter(is_active=True).order_by('-end_date').first()

        if active and active.end_date > now:
            start = active.end_date
        else:
            start = now

        end = start + timedelta(days=180)

        VendorSubscription.objects.create(
            vendor=vendor,
            plan='basic',
            start_date=start,
            end_date=end,
            is_active=True
        )

        return Response({'message': 'Subscription renewed', 'end_date': end})
	
	
	
	
	
	