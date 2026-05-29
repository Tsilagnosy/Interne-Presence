from django.db import models

from apps.vendors.models import Vendor


class Category(models.Model):

    name = models.CharField(max_length=255)

    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):

    PRODUCT_TYPE_CHOICES = (
        ('physical', 'Physical'),
        ('digital', 'Digital'),
    )

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='products'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products'
    )

    name = models.CharField(max_length=255)

    slug = models.SlugField(unique=True)

    description = models.TextField()

    product_type = models.CharField(
        max_length=20,
        choices=PRODUCT_TYPE_CHOICES,
        default='physical'
    )

    stock_quantity = models.PositiveIntegerField(default=0)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    minimum_bulk_quantity = models.PositiveIntegerField(
        default=0
    )

    city = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    delivery_time = models.CharField(max_length=100)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name	
	
	
class ProductImage(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(
        upload_to='products/images/'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.name
	
	
	