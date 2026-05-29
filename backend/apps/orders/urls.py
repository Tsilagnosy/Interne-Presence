from django.urls import path

from .views import (
    DeliveryMethodsView,
    MyCartView,
    AddToCartView,
    RemoveCartItemView,
    CheckoutView,
    PaymentMethodsView,
    GuestCartCreateView,
    GuestCartView,
    GuestAddToCartView,
)

urlpatterns = [
    path(
        'delivery-methods/',
        DeliveryMethodsView.as_view()
    ),
    path(
        'payment-methods/',
        PaymentMethodsView.as_view()
    ),
    path(
        'cart/',
        MyCartView.as_view()
    ),
    path(
        'guest-cart/create/',
        GuestCartCreateView.as_view()
    ),
    path(
        'guest-cart/<str:token>/',
        GuestCartView.as_view()
    ),
    path(
        'guest-cart/add/',
        GuestAddToCartView.as_view()
    ),
    path(
        'cart/add/',
        AddToCartView.as_view()
    ),
    path(
        'cart/item/<int:pk>/delete/',
        RemoveCartItemView.as_view()
    ),
    path(
        'checkout/',
        CheckoutView.as_view()
    ),
]	
	
	
	
	
	
	
	
	
	
	