# Guide d'intégration Frontend - Système de commande pour visiteurs

## 📋 Résumé des changements backend

Votre backend supporte maintenant les commandes de **visiteurs non authentifiés** avec choix de méthode de paiement et de livraison.

## 🛒 Flux de commande recommandé pour le frontend

### Étape 1: Afficher les produits
```typescript
// Les produits sont accessibles sans authentification
GET /api/products/
```

### Étape 2: Afficher les options de paiement
Avant le checkout, chargez les méthodes disponibles:

```typescript
// Récupérer les méthodes de paiement
const response = await fetch('/api/payments/methods/');
const paymentMethods = await response.json();
// Retour: [
//   { id: 'mvola', name: 'MVola', description: '...' },
//   { id: 'airtel_money', name: 'Airtel Money', description: '...' },
//   { id: 'paypal', name: 'PayPal', description: '...' }
// ]
```

### Étape 3: Afficher les options de livraison
```typescript
// Récupérer les méthodes de livraison
const response = await fetch('/api/orders/delivery-methods/');
const deliveryMethods = await response.json();
// Retour: [
//   { id: 'standard', name: 'Standard (5-7 jours)', price: 0, ... },
//   { id: 'express', name: 'Express (2-3 jours)', price: 5.00, ... },
//   { id: 'overnight', name: 'Overnight (1 jour)', price: 15.00, ... }
// ]
```

### Étape 4: Finaliser la commande
Pour les **visiteurs non authentifiés**:

```typescript
const checkoutData = {
  // Articles du panier (local/session storage)
  cart_items: [
    { product_id: 1, quantity: 2 },
    { product_id: 3, quantity: 1 }
  ],
  
  // Informations de livraison
  shipping_address: "123 Rue Principale",
  city: "Antananarivo",
  country: "Madagascar",
  phone_number: "+261 XX XXX XX XX",
  
  // Choix du visiteur
  delivery_method: "express",  // Au choix du visiteur
  payment_method: "paypal",     // Au choix du visiteur
  
  // Informations du visiteur
  guest_email: "visiteur@example.com",
  guest_name: "Jean Dupont"
};

const response = await fetch('/api/orders/checkout/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(checkoutData)
});

const result = await response.json();
// Retour:
// {
//   "message": "Commande créée avec succès",
//   "order": { id, total_price, status, ... },
//   "payment": {
//     "transaction_id": "...",
//     "amount": "...",
//     "payment_method": "paypal"
//   }
// }
```

## 👤 Pour les utilisateurs authentifiés

Le flux reste similaire mais utilise le panier persistant:

```typescript
// 1. Récupérer le panier
GET /api/orders/cart/

// 2. Ajouter des articles
POST /api/orders/cart/add/
{ "product": 1, "quantity": 2 }

// 3. Checkout (sans cart_items, utilise le panier en DB)
POST /api/orders/checkout/
{
  "shipping_address": "...",
  "city": "...",
  "country": "...",
  "phone_number": "...",
  "delivery_method": "standard",
  "payment_method": "paypal"
}
```

## 📝 Réponse du checkout

```typescript
{
  "message": "Commande créée avec succès",
  "order": {
    "id": 123,
    "customer": null,  // null pour guests
    "guest_email": "visiteur@example.com",
    "guest_name": "Jean Dupont",
    "total_price": "45.50",
    "shipping_address": "123 Rue Principale",
    "city": "Antananarivo",
    "country": "Madagascar",
    "phone_number": "+261 XX XXX XX XX",
    "delivery_method": "express",
    "payment_method": "paypal",
    "status": "pending",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": "20.00"
      }
    ],
    "created_at": "2026-05-29T10:30:00Z"
  },
  "payment": {
    "transaction_id": "a1b2c3d4-e5f6-...",
    "amount": "45.50",
    "payment_method": "paypal"
  }
}
```

## 🔄 Gestion du panier côté frontend

### Pour les visiteurs (non authentifiés)
Stockez le panier en **localStorage** ou **sessionStorage**:

```typescript
// Ajouter au panier
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
cart.push({ product_id: 1, quantity: 2 });
localStorage.setItem('cart', JSON.stringify(cart));

// Récupérer le panier
const cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Calculer le total
const total = cart.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);
```

## ✅ Checklist d'intégration

- [ ] Créer une page de panier pour les visiteurs
- [ ] Charger les méthodes de paiement et afficher un select/radio
- [ ] Charger les méthodes de livraison et afficher options avec prix
- [ ] Créer un formulaire de livraison (adresse, ville, etc.)
- [ ] Soumettre le checkout avec cart_items depuis localStorage
- [ ] Afficher la confirmation avec order ID et payment ID
- [ ] Rediriger vers la page de paiement appropriée basée sur payment_method

## 🔗 Endpoints récapitulatif

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/users/` | - | Liste des utilisateurs |
| GET | `/api/payments/methods/` | - | Méthodes de paiement |
| GET | `/api/orders/delivery-methods/` | - | Méthodes de livraison |
| POST | `/api/orders/checkout/` | - | Créer une commande |
| GET | `/api/orders/cart/` | ✓ | Panier utilisateur |
| POST | `/api/orders/cart/add/` | ✓ | Ajouter au panier |
