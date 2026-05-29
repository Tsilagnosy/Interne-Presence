from django.db import models
from django.conf import settings


class Vendor(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_profile'
    )

    store_name = models.CharField(max_length=255)

    slug = models.SlugField(unique=True)

    description = models.TextField(blank=True)

    logo = models.ImageField(
        upload_to='vendors/logos/',
        blank=True,
        null=True
    )

    banner = models.ImageField(
        upload_to='vendors/banners/',
        blank=True,
        null=True
    )

    country = models.CharField(max_length=100)

    city = models.CharField(max_length=100)

    address = models.TextField(blank=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.store_name

    def has_active_subscription(self):
        from django.utils import timezone

        return self.subscriptions.filter(
            is_active=True,
            end_date__gte=timezone.now()
        ).exists()
	
class VendorSubscription(models.Model):

    PLAN_CHOICES = (
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('premium', 'Premium'),
    )

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )

    plan = models.CharField(
        max_length=20,
        choices=PLAN_CHOICES,
        default='basic'
    )

    start_date = models.DateTimeField(auto_now_add=True)

    end_date = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.vendor.store_name} - {self.plan}"

    def is_expired(self):

        from django.utils.timezone import now

        return now() > self.end_date
	