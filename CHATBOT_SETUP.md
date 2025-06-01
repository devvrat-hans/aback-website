# Chatbot Configuration Guide

## Issues Fixed:
1. ✅ Improved CORS headers for deployed environment
2. ✅ Enhanced error handling and debugging
3. ✅ Better input validation
4. ✅ Fixed API request format for Pinecone
5. ✅ Improved response parsing for multiple formats
6. ✅ Added comprehensive logging
7. ✅ Created test endpoint for debugging

## Required Configuration Steps:

### 1. Configure Pinecone Credentials
Edit `/api/chat-proxy.php` and replace these placeholder values with your actual Pinecone credentials:

```php
'api_key' => 'pc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'assistant_id' => 'asst-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
```

### 2. Test the Environment
1. Visit: `https://aback.ai/api/test.php` to verify PHP is working
2. Check that cURL and JSON extensions are enabled
3. Verify the test endpoint returns proper JSON

### 3. Test the Chat Proxy
After configuring credentials, test the proxy directly:
```bash
curl -X POST https://aback.ai/api/chat-proxy.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, can you help me?"}'
```

### 4. Monitor Logs
Check server error logs for detailed debugging information:
- All requests and responses are logged
- Error details include debug information
- Rate limiting is tracked

### 5. Security Notes for Production
Once working, remove debug information by:
1. Removing 'debug' fields from error responses
2. Disabling verbose logging
3. Re-enabling test.php access restrictions

## Common Issues and Solutions:

### Issue: "API key not configured"
- Solution: Replace placeholder API key with real Pinecone key

### Issue: "Assistant ID not configured"  
- Solution: Replace placeholder Assistant ID with real Pinecone Assistant ID

### Issue: CORS errors
- Solution: CORS headers have been fixed to allow all origins for deployment

### Issue: PHP not working
- Solution: Ensure PHP is properly configured on your hosting environment

### Issue: Pinecone API format errors
- Solution: API request format has been updated to match Pinecone specs

## Next Steps:
1. Get your actual Pinecone API credentials
2. Update the configuration in chat-proxy.php
3. Test the endpoint
4. Deploy and verify chatbot functionality
5. Remove debug information for production

## Testing Commands:
```javascript
// Test in browser console:
fetch('/api/test.php', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({test: 'hello'})})
  .then(r => r.json()).then(console.log);

// Test chat after configuration:
fetch('/api/chat-proxy.php', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: 'Hello'})})
  .then(r => r.json()).then(console.log);
```
