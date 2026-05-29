from django.db import models
from django.conf import settings

from apps.products.models import Product
from apps.vendors.models import Vendor


class Cart(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        null=True,
        blank=True
    )

    # token to support guest carts (no user)
    guest_token = models.CharField(max_length=64, null=True, blank=True, unique=True)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        if self.user:
            return f"Cart - {self.user.email}"
        return f"Guest Cart - {self.guest_token}"


class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.product.name	
	
	
class Order(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    DELIVERY_METHOD_CHOICES = (
        ('standard', 'Standard (5-7 jours)'),
        ('express', 'Express (2-3 jours)'),
        ('overnight', 'Overnight (1 jour)'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('mvola', 'MVola'),
        ('airtel_money', 'Airtel Money'),
        ('paypal', 'PayPal'),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
        null=True,
        blank=True
    )

    guest_email = models.EmailField(
        null=True,
        blank=True
    )

    guest_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    shipping_address = models.TextField()

    city = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    phone_number = models.CharField(max_length=20)

    delivery_method = models.CharField(
        max_length=20,
        choices=DELIVERY_METHOD_CHOICES,
        default='standard'
    )

    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        name = self.customer.email if self.customer else self.guest_email
        return f"Order #{self.id} - {name}"
	
	
class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return self.product.name	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	