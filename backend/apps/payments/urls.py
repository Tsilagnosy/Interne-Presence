from django.urls import path

from .views import (
    PaymentMethodsView,
    MyPaymentsView,
    CreatePayPalPaymentView,
    CreateSubscriptionPaymentView,
    ExecuteSubscriptionPaymentView,
)

urlpatterns = [
    path(
        'methods/',
        PaymentMethodsView.as_view()
    ),
    path(
        '',
        MyPaymentsView.as_view()
    ),
    path(
        'paypal/create/',
        CreatePayPalPaymentView.as_view()
    ),
    path(
        'paypal/subscription/create/',
        CreateSubscriptionPaymentView.as_view()
    ),
    path(
        'paypal/subscription/execute/',
        ExecuteSubscriptionPaymentView.as_view()
    ),
]
	
	
	
	
	
	
	
	
	
	