# Generated migration for adding guest support to Order model

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Make customer field nullable to support guest orders
        migrations.AlterField(
            model_name='order',
            name='customer',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='orders',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        # Add guest_email field
        migrations.AddField(
            model_name='order',
            name='guest_email',
            field=models.EmailField(
                max_length=254,
                null=True,
                blank=True
            ),
        ),
        # Add guest_name field
        migrations.AddField(
            model_name='order',
            name='guest_name',
            field=models.CharField(
                max_length=255,
                null=True,
                blank=True
            ),
        ),
        # Add delivery_method field
        migrations.AddField(
            model_name='order',
            name='delivery_method',
            field=models.CharField(
                choices=[
                    ('standard', 'Standard (5-7 jours)'),
                    ('express', 'Express (2-3 jours)'),
                    ('overnight', 'Overnight (1 jour)')
                ],
                default='standard',
                max_length=20
            ),
        ),
        # Add payment_method field
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                blank=True,
                choices=[
                    ('mvola', 'MVola'),
                    ('airtel_money', 'Airtel Money'),
                    ('paypal', 'PayPal')
                ],
                max_length=30,
                null=True
            ),
        ),
    ]
