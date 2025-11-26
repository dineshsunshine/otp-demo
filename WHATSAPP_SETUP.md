# WhatsApp Template Setup Guide

To use the OTP authentication flow, you need to create a template in your WhatsApp Manager.

## 1. Go to WhatsApp Manager
Navigate to the [Meta Business Suite](https://business.facebook.com/) > WhatsApp Manager > Account Tools > Message Templates.

## 2. Create a New Template
- **Category**: `AUTHENTICATION`
- **Name**: `auth_otp` (This must match the code in `src/app/api/send-otp/route.js`)
- **Language**: `English (US)`

## 3. Configure Content
- **Code Expiration**: Select "Yes" or "No" (Optional).
- **Body**:
    - Select "Add a variable" for the OTP code.
    - It should look like: `Your verification code is {{1}}.`
- **Button**:
    - Type: `Copy Code` (This adds a button to copy the OTP).
    - Or `URL` if you want a link. For this demo, we use the default or a simple body text.
    - *Note*: The code in `route.js` sends a button component. Ensure your template configuration matches or update the code to match your template structure.
    - **Recommended for this demo**:
        - Select "Custom" category if Authentication is too strict.
        - **Name**: `auth_otp`
        - **Body**: `Your verification code is {{1}}`
        - **Button**: `Url` -> `Static` -> `https://your-website.com` (or just no button if you remove the button component from `route.js`).

> **Important**: The provided code in `route.js` attempts to send a template with a button.
> ```javascript
> {
>   type: 'button',
>   sub_type: 'url',
>   index: 0,
>   parameters: [{ type: 'text', text: otp }]
> }
> ```
> If you create a simple template without a button, **you must remove the button object from the `components` array in `src/app/api/send-otp/route.js`**.

## 4. Submit for Review
Templates usually get approved instantly or within a few minutes.

## 5. Test
Once approved, use the "Test Mode" toggle in the app to switch between `hello_world` (pre-approved) and your new `auth_otp` template.
