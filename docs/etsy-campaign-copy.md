# Etsy Campaign Copy — Banwell Designs Email List

All copy below drives subscribers to the signup page with tracking parameters.
The discount code **WELCOME25** must be added as a coupon in Etsy Shop Manager → Marketing → Sales and Coupons (25% off, one use per buyer).

**IMPORTANT:** Never reveal the code in the copy. Customers must subscribe to get it.

## Short Links

| Use | Short Link | Tracks As |
|-----|-----------|-----------|
| Message to Buyers | https://tinyurl.com/26oxa4da | `etsy_message` |
| Package Insert QR | https://tinyurl.com/25os9aov | `etsy_insert` |
| Listing Description | https://tinyurl.com/25pggjsm | `website_landing` |

---

## 1. Etsy "Message to Buyers" (Auto-sent after purchase)

> Paste this into Etsy → Shop Manager → Settings → Info & Appearance → Message to Buyers

```
Thank you so much for your order! I hope you love your new piece.

Want 25% off your next order? Join our mailing list and we'll send you an exclusive discount code you can use right here on Etsy:

→ https://tinyurl.com/26oxa4da

Just enter your email and your code will be delivered instantly!

Thanks again for supporting handmade!
— Erin, Banwell Designs
```

---

## 2. Package Insert Card

> Print as a small card (4x6" or business card size) and include in every shipment.
> Generate a QR code pointing to the URL below.

**QR Code URL:** `https://tinyurl.com/25os9aov`

**Front of card:**

```
┌─────────────────────────────────┐
│                                 │
│     GET 25% OFF                 │
│     YOUR NEXT ORDER             │
│                                 │
│     Scan to get your exclusive  │
│     discount code:              │
│                                 │
│         [QR CODE HERE]          │
│                                 │
│     Works at Etsy checkout!     │
│                                 │
│        BANWELL DESIGNS          │
│                                 │
└─────────────────────────────────┘
```

---

## 3. Etsy Listing Description Footer CTA

> Append this to the bottom of every Etsy product listing description.

```
─────────────────────────
★ GET 25% OFF YOUR NEXT ORDER ★
Sign up for our mailing list to get an exclusive discount code:
https://tinyurl.com/25pggjsm
─────────────────────────
```

---

## Tracking Summary

| Source | Short Link | Tracking Params | Where Used |
|--------|-----------|-----------------|------------|
| Etsy buyer message | tinyurl.com/26oxa4da | `etsy_message / retail` | Auto-sent after purchase |
| Package insert QR | tinyurl.com/25os9aov | `etsy_insert / retail` | Physical card in shipment |
| Listing description | tinyurl.com/25pggjsm | `website_landing / retail` | Etsy product listing footer |
| Website footer | (auto) | `website_footer / retail` | Auto-set by footer widget |
| Website landing | (direct) | `website_landing / retail` | Direct visits to /subscribe |
