from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ProductImage
from .serializers import ProductImageSerializer


class ProductImageCreateView(
    generics.CreateAPIView
):

    queryset = ProductImage.objects.all()

    serializer_class = ProductImageSerializer

    permission_classes = [IsAuthenticated]
	
	
	
	
	
	
	