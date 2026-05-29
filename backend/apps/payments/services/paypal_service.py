import paypalrestsdk

from django.conf import settings


paypalrestsdk.configure({

    "mode": settings.PAYPAL_MODE,

    "client_id": settings.PAYPAL_CLIENT_ID,

    "client_secret":
    settings.PAYPAL_CLIENT_SECRET,
})


def create_paypal_payment(order):

    payment = paypalrestsdk.Payment({

        "intent": "sale",

        "payer": {
            "payment_method": "paypal"
        },

        "redirect_urls": {

            "return_url":
            "http://127.0.0.1:8000/api/payments/success/",

            "cancel_url":
            "http://127.0.0.1:8000/api/payments/cancel/"
        },

        "transactions": [{

            "amount": {
                "total": str(order.total_price),
                "currency": "USD"
            },

            "description":
            f"Order #{order.id}"

        }]
    })

    if payment.create():

        for link in payment.links:

            if link.rel == "approval_url":

                return {
                    "success": True,
                    "approval_url": link.href
                }

    return {
        "success": False,
        "error": payment.error
    }


def create_subscription_payment(amount, description, return_url, cancel_url):

    payment = paypalrestsdk.Payment({

        "intent": "sale",

        "payer": {
            "payment_method": "paypal"
        },

        "redirect_urls": {

            "return_url": return_url,

            "cancel_url": cancel_url
        },

        "transactions": [{

            "amount": {
                "total": str(amount),
                "currency": "USD"
            },

            "description": description

        }]
    })

    if payment.create():

        for link in payment.links:

            if link.rel == "approval_url":

                return {
                    "success": True,
                    "approval_url": link.href,
                    "payment_id": payment.id
                }

    return {
        "success": False,
        "error": payment.error
    }


def execute_payment(payment_id, payer_id):

    payment = paypalrestsdk.Payment.find(payment_id)

    if payment.execute({"payer_id": payer_id}):

        return {
            'success': True,
            'payment': payment
        }

    return {
        'success': False,
        'error': payment.error
    }
	
	
	
	
	
	
	
	
	
	