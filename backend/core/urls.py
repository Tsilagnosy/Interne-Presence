from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import CustomTokenObtainPairView
from apps.products.home_views import HomePageView


def redirect_to_frontend(request):
    return redirect(settings.FRONTEND_BASE_URL or 'http://localhost:3000/')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', redirect_to_frontend, name='root'),
    path('api/token/', CustomTokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/home/', HomePageView.as_view(), name='api-home'),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/vendors/', include('apps.vendors.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
	
	
	
	
	
	
	
	
	