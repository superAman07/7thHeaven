# 📱 Mobile Team - UI/UX Guidance & Backend Integration

> **Date:** February 9, 2026  
> **From:** Web Development Team  
> **Subject:** Celsius App Development Guidelines

---

## 🎯 Quick Summary

The **Tata CLiQ Luxury app** was shared as a **reference for premium aesthetics only** - not for exact replication. Our app should have its own identity while maintaining a luxury, premium feel.

**Live Website Reference:** [celsiuspop.com](https://celsiuspop.com)

---

## 🎨 UI/UX Direction

### What Client Wants:

- **Premium, Luxury Feel** - Elegant, sophisticated, smooth animations
- **Dark/Light Mode** - Support both (dark mode as default preferred)
- **Visual Polish** - Current UI needs more depth

### Improvements Needed:

- Subtle gradients and shadows
- Card elevation effects
- Micro-animations on buttons/cards
- Better typography hierarchy
- Cohesive color scheme (Gold #DDB040 as accent)

---

## 📍 7th Heaven Tab - Critical Updates

### Naming Convention

| ❌ Current          | ✅ Should Be                                           |
| ------------------- | ------------------------------------------------------ |
| Level 1, Level 2... | **1st Heaven**, **2nd Heaven**... up to **7th Heaven** |

### Features Required:

1. **Products Section** - Show all products up to admin-set price limit
   - API: `GET /api/v1/products/club`
2. **Network Tree** - Interactive tree visualization (like web version)
   - API: `GET /api/v1/network/graph`

3. **Reward Progress** - Display all 4 milestone levels

### 🎁 Reward Milestones (Odd Heavens Only)

| Heaven     | Reward Worth | Target Referrals |
| ---------- | ------------ | ---------------- |
| 1st Heaven | ₹5,000       | 5 members        |
| 3rd Heaven | ₹25,000      | 125 members      |
| 5th Heaven | ₹1,25,000    | 3,125 members    |
| 7th Heaven | **₹1 Crore** | 78,125 members   |

Display these as motivational progress cards with visual progress bars!

---

## 👤 Profile/Account Page

### Current Issue:

- No edit functionality visible

### Required Features:

- Edit Name
- Edit Phone (with OTP verification)
- Edit Email (with OTP verification)
- View/Edit Address

### Profile APIs:

| Method | Endpoint          | Purpose                            |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/api/v1/profile` | Fetch user profile                 |
| POST   | `/api/v1/profile` | Request OTP for phone/email change |
| PUT    | `/api/v1/profile` | Update profile with OTP            |

**POST Request Body (for OTP):**

```json
{
  "type": "email", // or "phone"
  "value": "newemail@example.com"
}
```

**PUT Request Body (for update):**

```json
{
  "fullName": "John Doe",
  "phone": "9999999999",
  "email": "new@email.com",
  "otp": "123456",
  "fullAddress": "123 Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India"
}
```

---

## 📞 Contact Page

Current design is too minimal. Should include:

- Company Name (Legal)
- Full Address
- Email
- Support Ticket Form

---

## 🔌 Backend API Quick Reference

### Authentication

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| POST   | `/api/v1/auth/send-otp`   | Send OTP to phone       |
| POST   | `/api/v1/auth/verify-otp` | Verify OTP & get token  |
| GET    | `/api/v1/auth/me`         | Get logged-in user info |
| POST   | `/api/v1/auth/logout`     | Logout                  |

### Products

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| GET    | `/api/v1/products`        | All products                 |
| GET    | `/api/v1/products/[slug]` | Single product               |
| GET    | `/api/v1/products/club`   | 7th Heaven eligible products |

### Cart

| Method | Endpoint              | Description     |
| ------ | --------------------- | --------------- |
| GET    | `/api/v1/cart`        | Get cart        |
| POST   | `/api/v1/cart/add`    | Add to cart     |
| PUT    | `/api/v1/cart/update` | Update quantity |
| DELETE | `/api/v1/cart/remove` | Remove item     |

### Network (7th Heaven)

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/v1/network`       | User network stats |
| GET    | `/api/v1/network/graph` | Full tree data     |

### Orders

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/v1/orders`      | User order history |
| GET    | `/api/v1/orders/[id]` | Order details      |

### Support

| Method | Endpoint          | Description           |
| ------ | ----------------- | --------------------- |
| POST   | `/api/v1/tickets` | Create support ticket |
| GET    | `/api/v1/tickets` | Get user tickets      |

---

## 🚀 Recommended Implementation Order

1. **Auth Flow** - OTP Login/Signup
2. **Home + Products** - With premium UI polish
3. **Cart & Checkout** - Full shopping flow
4. **7th Heaven** - Network tree, rewards, products
5. **Profile** - With edit functionality
6. **Orders & Support** - History and tickets

---

## 📌 Important Notes

- All authenticated endpoints require `Cookie: session_token=<jwt>`
- Response format: `{ success: true, data: {...} }` or `{ success: false, error: {...} }`
- Check Swagger docs at `/api-docs` for complete API details

---

## 🤝 Contact

For API questions or issues, reach out to the web development team.

**Let's build something premium! 🚀**
