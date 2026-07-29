Yes. You can, but **there are limitations** depending on exactly what you want to display.

### Option 1 (Recommended): Google Business Profile API ⭐⭐⭐⭐⭐

If you own the Google Business Profile for **Binday's Diner**, you can access some business information through Google's APIs.

However, **Google does not provide a public API to fetch all Google Maps reviews and ratings for display on your own website**. The Business Profile APIs focus more on managing the business rather than serving all review content publicly.

---

## Option 2 (Most Common): Google Places API

This is what most restaurant websites use.

Your website sends a request like:

```ts
GET https://maps.googleapis.com/maps/api/place/details/json
```

with

```
fields=name,rating,user_ratings_total,reviews
```

Example response

```json
{
  "rating": 4.8,
  "user_ratings_total": 152,
  "reviews": [
    {
      "author_name": "John",
      "rating": 5,
      "text": "Excellent lugaw!"
    }
  ]
}
```

Then your Next.js page displays

⭐⭐⭐⭐⭐ 4.8

Based on 152 Google Reviews

---

### Limitation

Google usually returns only **up to 5 reviews**, not all reviews.

You **cannot legally scrape Google Maps** to obtain all reviews.

---

# Option 3 (What I recommend for Binday's Diner)

Display

```
⭐⭐⭐⭐⭐ 4.8

Based on 152 Google Reviews

[Read all reviews on Google]
```

Then clicking the button opens your Google Maps listing.

This is fast and complies with Google's intended usage.

---

# Option 4 (Build Your Own Review System)

You can have two review sources.

```
Website

⭐⭐⭐⭐⭐
4.8

Google Reviews
(152)

★★★★☆
Website Reviews
(1,245)
```

Your own reviews are stored in PostgreSQL.

Advantages

- Unlimited reviews
- Photos
- Reply from owner
- AI moderation
- Loyalty rewards
- Customer badges
- Faster loading
- Full control over data

This is what many large restaurant chains do.

---

# Option 5 (Embed Google Reviews)

Google also lets you embed a Google Map.

```html
<iframe ...></iframe>
```

Users can click and view reviews directly on Google Maps, but you don't control the styling or the review list.

---

# For your Binday's Diner website

Since you're already planning features like **student meals, vouchers, loyalty cards, promotions, and an admin panel**, I'd recommend a hybrid approach:

```
Hero Section
-----------------------------------

⭐⭐⭐⭐⭐
4.8 Rating

152 Google Reviews

[See Reviews]
```

Then lower on the homepage:

```
Customer Reviews

★★★★★
"The best student meal near the campus."

★★★★★
"Lugaw is amazing."

★★★★★
"Affordable and delicious!"
```

Your website reviews can be filtered by:

- 🍜 Lugaw
- 🍗 Student Meals
- 🍔 Silog Meals
- ☕ Drinks

You could also reward customers with loyalty points after leaving a verified review on your website.

### Technical implementation

With your **Next.js + Express + PostgreSQL (Drizzle)** stack, you can:

- Use the **Google Places API** to periodically fetch the business's overall **rating** and **review count** (and the limited review snippets Google provides).
- Cache those values in your database to reduce API calls and improve page speed.
- Combine them with your own internal review system for richer testimonials and engagement.

This gives visitors the trust signal of Google ratings while letting you build a much more feature-rich review experience on your own site.
