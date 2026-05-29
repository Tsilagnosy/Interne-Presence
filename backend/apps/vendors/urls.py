from django.urls import path

from .views import (
    VendorListView,
    VendorDetailView,
    MyVendorProfileView,
    MyVendorProductsView,
    VendorDashboardStatsView
)
from .views import VendorRegisterView, VendorRenewSubscriptionView

urlpatterns = [

    path(
        '',
        VendorListView.as_view()
    ),

    path(
        'my-profile/',
        MyVendorProfileView.as_view()
    ),

    path(
        'my-products/',
        MyVendorProductsView.as_view()
    ),

    path(
        '<int:pk>/',
        VendorDetailView.as_view()
    ),
    path(
        'dashboard/stats/',
        VendorDashboardStatsView.as_view()
    ),
    path(
        'register/',
        VendorRegisterView.as_view()
    ),
    path(
        'subscription/renew/',
        VendorRenewSubscriptionView.as_view()
    ),
]