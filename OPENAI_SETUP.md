# Getting Your OpenAI API Key

Follow these steps to get your OpenAI API key for the summarizer feature:

## Step 1: Create OpenAI Account

1. **Visit**: https://platform.openai.com/signup
2. **Sign up** with your email or Google/Microsoft account
3. **Verify** your email address

## Step 2: Add Payment Method

⚠️ **Important**: OpenAI requires a payment method even for the free tier.

1. Go to: https://platform.openai.com/account/billing/overview
2. Click "Add payment method"
3. Enter your credit/debit card details
4. You'll get **$5 free credits** to start with

## Step 3: Get Your API Key

1. **Navigate to**: https://platform.openai.com/api-keys
2. **Click**: "Create new secret key"
3. **Name it**: (e.g., "Hooli Backend")
4. **Copy** the key immediately (starts with `sk-...`)

⚠️ **Critical**: Save it somewhere safe - you won't see it again!

## Step 4: Add to Your `.env` File

Open `backend/.env` and add your key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

## Pricing

The summarizer uses **GPT-4o-mini** which is very cost-effective:

| Model | Input | Output | Example Cost |
|-------|-------|--------|--------------|
| GPT-4o-mini | $0.150 / 1M tokens | $0.600 / 1M tokens | ~$0.01 per 100 summaries |

### Cost Example:
- **Average transcript**: 500 tokens (words)
- **Average summary**: 100 tokens
- **Cost per summary**: ~$0.0001 (less than a penny!)
- **With $5 free credits**: ~50,000 summaries

## Models Available

The endpoint uses `gpt-4o-mini` by default, but you can change it in `backend/server.js`:

```javascript
// Budget-friendly (default)
model: "gpt-4o-mini"

// Most capable
model: "gpt-4-turbo"

// Fast and cheap
model: "gpt-3.5-turbo"
```

## Rate Limits

Free tier limits:
- **Requests per minute**: 3
- **Tokens per minute**: 40,000

Paid tier (Tier 1 - after $5 spent):
- **Requests per minute**: 500
- **Tokens per minute**: 200,000

## Testing Your Setup

Once you've added the key, test it:

```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "This is a test transcript to verify the API key works."
  }'
```

You should get a summary response!

## Troubleshooting

### "OpenAI API key not configured"
- Make sure `OPENAI_API_KEY` is in your `backend/.env` file
- Restart your backend server after adding the key

### "Incorrect API key provided"
- Check that you copied the full key (starts with `sk-`)
- No extra spaces or quotes around the key
- Key is still active (not deleted from OpenAI dashboard)

### "Rate limit exceeded"
- Wait a minute and try again
- Upgrade to paid tier if needed

### "Insufficient quota"
- Your free credits ran out
- Add $10+ to your account at https://platform.openai.com/account/billing/overview

## Security Best Practices

1. ✅ **Never commit** `.env` files to git
2. ✅ **Rotate keys** if they're exposed
3. ✅ **Monitor usage** in OpenAI dashboard
4. ✅ **Set spending limits** to prevent surprises
5. ✅ **Use separate keys** for dev and production

## Monitoring Usage

Track your API usage:
- **Dashboard**: https://platform.openai.com/usage
- **See costs** in real-time
- **Set alerts** for spending thresholds

---

*Last Updated: October 4, 2025*

