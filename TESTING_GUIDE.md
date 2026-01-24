# 🧪 RELAYA Testing Guide

## Quick Start Testing

### 1. Start the Application
```bash
cd C:\Users\Admin\job1\landing-website-bunch\relaya
npm run dev
```

### 2. Login
- Navigate to http://localhost:5173
- Click "Sign In"
- Use your Supabase credentials
- You'll be redirected to Dashboard

### 3. Check Console
Look for:
```
🔐 Calling login API for fresh access token...
✅ Fresh access token obtained
AI API client initialized successfully
```

---

## Testing Each Component

### ✅ ServiceModal (50 PR Services)

**Test Service: Autonomous Press Release Generator**
1. Dashboard → Services tab
2. Click "Autonomous Press Release Generator" (Layer 1)
3. Fill in required fields:
   - Company Name: "Test Company"
   - Product/Service: "AI Platform"
   - Key Message: "Revolutionary AI technology"
4. Optional: Upload a PDF file
5. Click "Generate Content"
6. **Verify:**
   - ✅ Loading status appears
   - ✅ "10-15 minutes" time estimate shows
   - ✅ File upload progress (if uploaded)
   - ✅ Text streams token-by-token
   - ✅ "Complete" message appears
   - ✅ Export buttons work (Copy, PDF, Word)

**Console should show:**
```
🔐 Calling login API for fresh access token...
✅ Fresh access token obtained
🔐 Calling login API for fresh access token... (session)
✅ Fresh access token obtained
🔐 Calling login API for fresh access token... (if file)
✅ Fresh access token obtained
🔐 Calling login API for fresh access token... (chat)
✅ Fresh access token obtained
```

---

### ✅ Press Kit Builder

1. Dashboard → Tools tab → Press Kit
2. Fill company details:
   - Company Name: "Test Corp"
   - Boilerplate: "We are a leading tech company..."
3. Click "Generate Press Kit"
4. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ Text streams
   - ✅ Export PDF works

---

### ✅ Brand Voice Trainer

**Part 1: Analyze Voice**
1. Dashboard → Tools tab → Voice
2. Paste sample content (200+ characters):
   ```
   Our company delivers innovative solutions that empower businesses.
   We believe in transparency, excellence, and customer success.
   Our team is dedicated to pushing boundaries and creating impact.
   ```
3. Click "Analyze Voice Profile"
4. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ Voice profile generated

**Part 2: Generate with Voice**
5. Enter test instructions: "Write an announcement about our new product"
6. Click "Generate with Brand Voice"
7. **Verify:**
   - ✅ Loading status appears
   - ✅ Text streams
   - ✅ Content matches voice style

---

### ✅ Campaign Planner

1. Dashboard → Tools tab → Campaigns
2. Click "Create New Campaign"
3. Fill form:
   - Name: "Product Launch 2026"
   - Type: "Product Launch"
   - Start Date: Today
   - End Date: +30 days
   - Objectives: "Increase awareness"
   - Channels: Select 2-3
4. Click "Auto-Generate Plan"
5. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ Campaign plan streams
   - ✅ Tasks and timeline generated

---

### ✅ Social Media Publisher

1. Dashboard → Tools tab → Distribute
2. Go to Settings → Enable Twitter and LinkedIn
3. Go to Compose
4. Enter content:
   ```
   Excited to announce our new AI platform!
   Revolutionary technology for businesses.
   ```
5. Click "Optimize for 2 Platforms"
6. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ Platform-specific content streams
   - ✅ Copy button works

---

### ✅ Image Generator

1. Dashboard → Tools tab → Images
2. Enter description:
   ```
   Professional headshot of a confident business executive
   in a modern office setting with natural lighting
   ```
3. Click "Generate Image Concept & Prompt"
4. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ Image concept text streams
   - ✅ Includes: prompt, composition, style, technical specs
   - ✅ Copy button works

---

### ✅ URL Analyzer

1. Dashboard → Tools tab → SEO
2. Enter URL: `https://example.com`
3. Click "Analyze"
4. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ SEO analysis streams
   - ✅ Includes: SEO, LLMO, AIO, GEO sections

---

### ✅ Competitor Analyzer

1. Dashboard → Tools tab → Compare
2. Enter 2-3 URLs:
   - URL 1: `https://competitor1.com`
   - URL 2: `https://competitor2.com`
   - URL 3: `https://competitor3.com`
3. Click "Compare SEO"
4. **Verify:**
   - ✅ Loading status appears
   - ✅ Time estimate shows
   - ✅ Competitive analysis streams
   - ✅ Includes comparison, strengths, weaknesses

---

## Test File Upload

**Service with File Upload:**
1. Open any PR service
2. Upload 2 files:
   - File 1: sample.pdf (or .txt)
   - File 2: document.docx
3. Fill form fields
4. Click "Generate Content"

**Verify Sequential Upload:**
```
Loading: Uploading documents...
Status: Uploading sample.pdf (1/2)...
Status: Uploading document.docx (2/2)...
Status: Starting AI agents...
```

---

## Test Progress Indicators

**Every service should show:**

1. **Before Upload (if files):**
   ```
   ┌─────────────────────────────────────┐
   │ 📤 Uploading Files                  │
   │ sample.pdf (1/2)                    │
   │ [████████████░░░░░░░░] 50%         │
   └─────────────────────────────────────┘
   ```

2. **During Processing:**
   ```
   ┌─────────────────────────────────────┐
   │ ⚡ Creating session...              │
   └─────────────────────────────────────┘

   ┌─────────────────────────────────────┐
   │ ⏰ Processing time: 10-15 minutes   │
   └─────────────────────────────────────┘
   ```

3. **During Streaming:**
   ```
   ┌─────────────────────────────────────┐
   │ ⚡ Waking Agents                    │
   └─────────────────────────────────────┘

   Active AI agents: 3
   ```

---

## Test Error Handling

### Scenario 1: Empty Fields
1. Open any service
2. Leave required fields empty
3. Click Generate
4. **Verify:** Toast error "Missing Required Fields"

### Scenario 2: Network Error
1. Open any service
2. Disconnect internet
3. Click Generate
4. **Verify:**
   - Toast error "Generation Failed"
   - Loading state cleared
   - Can retry after reconnecting

### Scenario 3: Invalid URL
1. URL Analyzer
2. Enter: "not-a-url"
3. Click Analyze
4. **Verify:** Error handling works

---

## Browser DevTools Checks

### Console Logs
**Expected (per service call):**
```
🔐 Calling login API for fresh access token...
✅ Fresh access token obtained
```

**Multiple times per service:**
- Session creation: 1x
- File upload: Nx (N = number of files)
- Chat: 1x

### Network Tab
**Check requests to:**
```
POST https://socket-server-lke3f.ondigitalocean.app/api/auth/login
POST https://socket-server-lke3f.ondigitalocean.app/webhook/create-new-chat
POST https://socket-server-lke3f.ondigitalocean.app/webhook/vectorize-documents
POST https://socket-server-lke3f.ondigitalocean.app/api/core/chating (SSE)
```

**All should return 200 OK**

### LocalStorage
**Check stored values:**
```javascript
localStorage.getItem('ai_access_token')  // Should exist
localStorage.getItem('ai_refresh_token') // Should exist
localStorage.getItem('ai_user_id')       // Should exist
```

---

## Performance Tests

### 1. Token Refresh Frequency
- Each service call triggers 1-4 login calls
- Monitor for rate limiting
- Check response times

### 2. Streaming Performance
- Text should appear smoothly
- No lag or freezing
- Memory usage should be stable

### 3. Long-Running Jobs
- Test with complex services
- Verify 10-15 minute processing
- Ensure connection doesn't timeout

---

## Regression Tests

### Services Tab
- ✅ All 50 services open modal
- ✅ Layer filtering works (1-10)
- ✅ Search functionality works
- ✅ Service cards display correctly

### Tools Tab
- ✅ All 8 tool tabs load
- ✅ Tab switching works
- ✅ Each tool functions independently

### Export Features
- ✅ Copy to clipboard works
- ✅ PDF export downloads
- ✅ Word export downloads
- ✅ Filenames include timestamps

---

## Smoke Test (Quick 5-min Check)

1. **Login:** ✅ Can login
2. **Dashboard:** ✅ Dashboard loads
3. **Service:** ✅ Open 1 PR service, generate content
4. **Tool:** ✅ Open Press Kit Builder, generate
5. **File:** ✅ Upload file in any service
6. **Export:** ✅ Copy/export result
7. **Error:** ✅ Leave field empty, get error

**If all pass:** System is functional ✅

---

## Common Issues & Solutions

### Issue: "this.tokenManager.ensureValidToken is not a function"
**Solution:** Refresh page - old code cached

### Issue: No streaming text appears
**Check:**
- Network tab for SSE connection
- Console for errors
- Backend CORS settings

### Issue: Files not uploading
**Check:**
- File type (PDF, Word, text only)
- File size (<10MB)
- Sequential upload logs in console

### Issue: Token not found
**Solution:**
- Clear localStorage
- Refresh page
- Should trigger new login

---

## Success Criteria

✅ **All services work end-to-end**
✅ **Streaming displays correctly**
✅ **Progress indicators show**
✅ **File uploads work sequentially**
✅ **Export functions work**
✅ **Error handling works**
✅ **No Supabase function errors**
✅ **Fresh tokens obtained per request**

---

## Test Report Template

```
RELAYA Testing Report
Date: _____________
Tester: ___________

Component Tests:
[ ] ServiceModal (50 services) - Tested _____ services
[ ] PressKitBuilder
[ ] BrandVoiceTrainer
[ ] ImageGenerator
[ ] CampaignPlanner
[ ] SocialMediaPublisher
[ ] UrlAnalyzer
[ ] CompetitorAnalyzer

Feature Tests:
[ ] File upload (sequential)
[ ] SSE streaming
[ ] Progress indicators
[ ] Export (Copy/PDF/Word)
[ ] Error handling
[ ] Token refresh

Issues Found:
_________________________________
_________________________________
_________________________________

Overall Status: PASS / FAIL
```

---

*Ready to test? Start with the Smoke Test!* 🚀
