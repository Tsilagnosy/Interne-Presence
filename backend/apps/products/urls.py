from django.urls import path
from .views import (
    ProductListView,
    ProductCreateView,
    ProductDetailView,
    ProductUpdateView,
    ProductDeleteView,
)
from .image_views import ProductImageCreateView
from .category_views import CategoryListView 
urlpatterns = [

    path(
        '',
        ProductListView.as_view()
    ),

    path(
        'create/',
        ProductCreateView.as_view()
    ),

    path(
        '<int:pk>/',
        ProductDetailView.as_view()
    ),

    path(
        '<int:pk>/update/',
        ProductUpdateView.as_view()
    ),

    path(
        '<int:pk>/delete/',
        ProductDeleteView.as_view()
    ),

    path(
        'categories/',
        CategoryListView.as_view()
    ),
     path(
        'upload-image/',
        ProductImageCreateView.as_view()
    ),
]
	
	
	
	
	
	
	