# Admin E-Commerce Catalog and Order Flow

Base URL: `http://localhost:3000`

All protected requests use:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

API responses use the envelope `{ "success": true, "data": ... }`. IDs shown below must be taken from `data.id` in the previous response.

## 1. Authenticate the single admin

`POST /auth/login`

```json
{
  "email": "<SUPER_ADMIN_EMAIL>",
  "password": "<SUPER_ADMIN_PASSWORD>"
}
```

Save `data.accessToken`. The returned role must be `admin` or `super_admin`.

## 2. Read or configure the store

- `GET /stores/current` — public current-store endpoint.
- `POST /stores` — configure the store once, admin-only.
- `PUT /stores/current` — update the configured store, admin-only.

Creation payload:

```json
{
  "name": "Zaroox",
  "slug": "zaroox",
  "description": "Official Zaroox store",
  "isActive": true
}
```

The database and service layer reject a second store.

## 3. Create a product

`POST /products`

```json
{
  "name": "Essential Cotton T-Shirt",
  "slug": "essential-cotton-tshirt",
  "shortDesc": "Premium combed cotton T-shirt",
  "fullDesc": "Product details and care instructions",
  "basePrice": 1999,
  "currency": "PKR",
  "isActive": true,
  "isDigital": false,
  "requiresShipping": true,
  "taxClass": "standard",
  "status": "active"
}
```

The server assigns the singleton store. Clients cannot select another store.

## 4. Upload product images

Use multipart form data with `POST /products/images/upload`:

```text
file=<JPEG, PNG, WebP, GIF or SVG; maximum 5 MB>
productId=<product UUID>
altText=Front view of Essential Cotton T-Shirt
sortOrder=0
isPrimary=true
```

Multiple files can be sent to `POST /products/images/upload-multiple` using repeated `files` fields and one `productId`. Files are stored in Cloudflare R2. Only one primary image is allowed per product.

An already-hosted image can be registered with `POST /products/images`:

```json
{
  "productId": "<product UUID>",
  "url": "https://cdn.example.com/products/tshirt-front.webp",
  "altText": "Front view",
  "sortOrder": 0,
  "isPrimary": true
}
```

## 5. Define variant option types

Create Color:

`POST /products/attributes/keys`

```json
{ "name": "Color", "slug": "color", "inputType": "swatch" }
```

Create Size:

```json
{ "name": "Size", "slug": "size", "inputType": "select" }
```

Allowed input types are `select`, `swatch`, `text`, and `boolean`.

## 6. Define option values

`POST /products/attributes/keys/<colorKeyId>/values`

```json
{ "value": "Red", "displayValue": "#FF0000", "sortOrder": 1 }
```

Repeat for Blue, then add `S`, `M`, and other sizes under the Size key. The backend rejects assigning a value to the wrong key.

## 7. Create every sellable variant

Create one SKU per Color × Size combination with `POST /products/variants`:

```json
{
  "productId": "<product UUID>",
  "sku": "TSHIRT-RED-S",
  "price": 1999,
  "weightGrams": 250,
  "isActive": true
}
```

Examples:

| Combination | SKU | Price |
|---|---|---:|
| Red / S | TSHIRT-RED-S | 1999 |
| Red / M | TSHIRT-RED-M | 2099 |
| Blue / S | TSHIRT-BLUE-S | 2049 |
| Blue / M | TSHIRT-BLUE-M | 2149 |

SKUs are globally unique. Prices must be positive; when omitted, checkout uses the product base price.

## 8. Attach Color and Size to each variant

For each variant call `POST /products/variants/<variantId>/attributes` twice.

Color assignment:

```json
{
  "attributeKeyId": "<colorKeyId>",
  "attributeValueId": "<redValueId>"
}
```

Size assignment:

```json
{
  "attributeKeyId": "<sizeKeyId>",
  "attributeValueId": "<smallValueId>"
}
```

The backend rejects duplicate keys on one variant, mismatched key/value pairs, and duplicate option combinations within a product.

Verify the complete storefront representation with `GET /products/<productId>`. Each item in `data.variants` includes its `attributeValues`, keys, and display values.

## 9. Configure inventory

List warehouses with `GET /warehouses`. Create one with `POST /warehouses` if required:

```json
{
  "code": "WH-LHR-01",
  "name": "Lahore Main Warehouse",
  "line1": "1 Industrial Road",
  "city": "Lahore",
  "country": "Pakistan",
  "isActive": true
}
```

Set stock separately for every variant using `POST /inventory/set`:

```json
{
  "warehouseId": "<warehouse UUID>",
  "variantId": "<variant UUID>",
  "qtyOnHand": 25,
  "lowStockThreshold": 5
}
```

Useful inventory endpoints:

- `POST /inventory/adjust` — atomically add or subtract physical stock.
- `POST /inventory/reserve` — reserve a positive quantity when sufficient stock exists.
- `POST /inventory/release` — release a reservation.
- `GET /inventory?variantId=<variantId>` — inspect stock.
- `GET /inventory/low-stock` — list low-stock variants.

Negative available inventory and over-reservation are rejected at both service and database levels.

## 10. Customer purchase verification

Register a customer with `POST /auth/register`, then login with `POST /auth/login`.

Add a variant to the cart:

`POST /cart/mine/items`

```json
{ "variantId": "<variant UUID>", "quantity": 2 }
```

The backend verifies the product and variant are active, resolves the effective server-side price, and rejects quantities exceeding available stock.

Place the order:

Preferred production flow: `POST /checkout`. This endpoint reads the authenticated customer's cart, recalculates prices, checks inventory, creates the order idempotently, and clears the cart.

```json
{
  "idempotencyKey": "checkout-unique-client-generated-value",
  "paymentMethod": "cash_on_delivery",
  "shippingLine1": "1 Test Road",
  "shippingCity": "Lahore",
  "shippingCountry": "PK"
}
```

Use `paymentMethod: "stripe"` plus `successUrl` and `cancelUrl` after Stripe credentials have been added. Repeating the same key for the same user returns the original order instead of charging or ordering twice.

The lower-level order endpoint is:

`POST /orders`

```json
{
  "order": {
    "shippingAmount": 150,
    "shippingLine1": "1 Test Road",
    "shippingCity": "Lahore",
    "shippingCountry": "PK"
  },
  "items": [
    { "variantId": "<variant UUID>", "quantity": 2 }
  ]
}
```

Prices and totals are calculated server-side. Inventory rows are locked and decremented in the same database transaction as order creation, preventing concurrent overselling.

## 11. Admin order processing

- `GET /orders` — list all orders as admin.
- `GET /orders/<orderId>` — order summary.
- `GET /orders/<orderId>/items` — order lines.
- `PUT /orders/<orderId>/status` — advance status.

```json
{ "status": "confirmed" }
```

Continue with `shipped` and `delivered` according to fulfillment progress. Shipment records are managed under `/shipping/shipments`.

Cancellation uses `PUT /orders/<orderId>/cancel`. It is accepted only before shipment, restores the exact captured warehouse allocations, records reversal movements, and is safe to retry without restoring stock twice.

Returns may be requested only for delivered orders. Return lines must belong to that order and cannot exceed the remaining returnable quantity. The admin advances returns through `requested → approved → item_shipped → item_received → inspecting → refund_processed/exchanged → closed`. Stock is restored when the item is physically received, not when the request is opened.

## Expected security and validation checks

- A customer receives `403` for every catalog, store, warehouse, inventory, and shipment mutation.
- A second store receives `409`.
- Duplicate SKU receives `409`.
- Invalid or mismatched attribute values receive `400`.
- Duplicate variant combinations receive `409`.
- Unsupported image type or image over 5 MB receives `400`.
- Cart quantities above available stock receive `400`.
- Concurrent orders cannot reduce stock below reserved stock.
