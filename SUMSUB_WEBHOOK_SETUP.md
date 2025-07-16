# Sumsub Webhook Setup Guide

## 📋 Prerequisites

- Sumsub account with admin access
- Your server must be accessible via HTTPS
- Your webhook endpoint must be publicly reachable

## 🔧 Step-by-Step Setup

### 1. Access Sumsub Dashboard

1. Log into your Sumsub account
2. Navigate to **Settings** → **Webhooks** (or **Developer Tools** → **Webhooks**)

### 2. Create New Webhook

1. Click **"Add Webhook"** or **"Create Webhook"**
2. Configure the following settings:

#### **Basic Configuration**

- **Webhook URL**: `https://your-domain.com/api/sumsub/webhook`
- **Method**: POST
- **Content-Type**: application/json

#### **Events to Listen For**

Select these events:

- ✅ `applicantCreated` - When applicant is created
- ✅ `applicantPending` - When verification is pending
- ✅ `applicantReviewed` - When verification is completed
- ✅ `applicantOnHold` - When verification is put on hold

### 3. Webhook Configuration Details

#### **Authentication**

- Sumsub will send signature headers for verification
- Headers: `X-App-Access-Ts` and `X-App-Access-Sig`
- Our code automatically verifies these signatures

#### **Webhook Payload Structure**

Based on [Sumsub documentation](https://docs.sumsub.com/docs/user-verification-webhooks):

```json
{
  "applicantId": "unique_applicant_id",
  "externalUserId": "your_user_id",
  "levelName": "basic-kyc-level",
  "type": "applicantReviewed",
  "reviewResult": {
    "reviewAnswer": "GREEN"
  },
  "reviewStatus": "completed"
}
```

### 4. Environment-Specific URLs

#### **Development**

```
https://your-dev-domain.com/api/sumsub/webhook
```

#### **Production**

```
https://your-prod-domain.com/api/sumsub/webhook
```

### 5. Verify Configuration

1. Check webhook status shows "Active" or "Enabled"
2. Look for any delivery errors in the dashboard
3. Test the webhook if Sumsub provides a test feature

## 🔍 Testing the Setup

### 1. Test Webhook Endpoint

Use the "Test Webhook URL" button in the user dropdown to verify your endpoint is accessible.

### 2. Monitor Console Logs

When you start verification, look for these logs:

- `=== WEBHOOK ENDPOINT HIT ===`
- `🆕 Applicant created webhook received!`
- `✅ Updated user with real applicantId`

### 3. Expected Webhook Flow

1. **Start verification** → User gets temporary applicantId
2. **Submit documents** → `applicantCreated` webhook received
3. **Documents pending** → `applicantPending` webhook received
4. **Verification completed** → `applicantReviewed` webhook received

## ⚠️ Common Issues

### **Webhook Not Receiving Calls**

1. Check webhook URL is correct and accessible
2. Verify HTTPS is enabled
3. Check server firewall settings
4. Look for webhook delivery errors in Sumsub dashboard

### **Signature Verification Failing**

1. Verify `SUMSUB_SECRET_KEY` environment variable is correct
2. Check webhook URL path matches exactly
3. Ensure timestamp and signature headers are present

### **User Not Found**

1. Check if `externalUserId` matches between creation and webhook
2. Verify temporary applicantId is being saved correctly
3. Look for applicantId matching in webhook logs

## 🧪 Debugging Commands

### **Test Webhook Endpoint**

```bash
curl -X GET https://your-domain.com/api/sumsub/webhook/test
```

### **Check User Metadata**

Use the "Debug Metadata" button in the user dropdown.

### **Manual Verification Test**

Use the "Test Verify" button to manually set verification status.

## 📞 Support

If webhooks still don't work after configuration:

1. Check Sumsub webhook logs in dashboard
2. Verify your domain is accessible from the internet
3. Contact Sumsub support for webhook configuration help
4. Check server logs for any webhook delivery errors
