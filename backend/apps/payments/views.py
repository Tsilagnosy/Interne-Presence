from rest_framework import generics
from rest_framework.permissions import (
    IsAuthenticated, AllowAny
)
from rest_framework.views import APIView
from rest_framework.response import Response

from .services.paypal_service import (create_paypal_payment)
from apps.orders.models import Order		
from .models import PaymentTransaction
from .serializers import (
    PaymentTransactionSerializer
)


class PaymentMethodsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Retourne les méthodes de paiement disponibles"""
        payment_methods = [
            {
                'id': 'mvola',
                'name': 'MVola',
                'description': 'Paiement par MVola'
            },
            {
                'id': 'airtel_money',
                'name': 'Airtel Money',
                'description': 'Paiement par Airtel Money'
            },
            {
                'id': 'paypal',
                'name': 'PayPal',
                'description': 'Paiement par PayPal'
            }
        ]
        return Response(payment_methods)


class MyPaymentsView(
    generics.ListAPIView
):

    serializer_class = (
        PaymentTransactionSerializer
    )

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return PaymentTransaction.objects.filter(
            order__customer=self.request.user
        )	
	
class CreatePayPalPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        order_id = request.data.get(
            'order_id'
        )

        order = Order.objects.get(
            id=order_id
        )

        result = create_paypal_payment(
            order
        )

        if result['success']:

            return Response({
                'approval_url':
                result['approval_url']
            })

        return Response({
            'error': result['error']
        })	


class CreateSubscriptionPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        vendor_id = request.data.get('vendor_id')
        amount = request.data.get('amount')

        if not vendor_id or not amount:
            return Response({'error': 'vendor_id and amount required'}, status=400)

        from apps.vendors.models import Vendor

        try:
            vendor = Vendor.objects.get(id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)

        from .services.paypal_service import create_subscription_payment
        from django.conf import settings

        return_url = f"{settings.FRONTEND_BASE_URL}/vendors/payment-success?vendor_id={vendor.id}"
        cancel_url = f"{settings.FRONTEND_BASE_URL}/vendors/payment-cancel?vendor_id={vendor.id}"

        result = create_subscription_payment(amount, f"Subscription for {vendor.store_name}", return_url, cancel_url)

        if result['success']:

            return Response({
                'approval_url': result['approval_url'],
                'payment_id': result.get('payment_id')
            })

        return Response({'error': result['error']}, status=500)


class ExecuteSubscriptionPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        payment_id = request.data.get('paymentId')
        payer_id = request.data.get('PayerID')
        vendor_id = request.data.get('vendor_id')

        if not payment_id or not payer_id or not vendor_id:
            return Response({'error': 'paymentId, PayerID and vendor_id required'}, status=400)

        from .services.paypal_service import execute_payment
        from apps.vendors.models import Vendor, VendorSubscription
        from django.utils import timezone
        from datetime import timedelta

        result = execute_payment(payment_id, payer_id)

        if not result['success']:
            return Response({'error': result['error']}, status=500)

        try:
            vendor = Vendor.objects.get(id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)

        start = timezone.now()
        end = start + timedelta(days=180)

        VendorSubscription.objects.create(
            vendor=vendor,
            plan='basic',
            start_date=start,
            end_date=end,
            is_active=True
        )

        return Response({'message': 'Subscription activated', 'end_date': end})
	
	
	
	
	
	
	
	
	
	
	
	
		
	
	
	
	
	
	
	
	
