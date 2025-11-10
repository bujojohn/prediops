# Perplexity MCP Troubleshooting Guide

## ✅ What's Verified Working
- ✅ API Key is valid (tested successfully)
- ✅ Server file exists and has correct code
- ✅ Node.js path is correct
- ✅ MCP SDK is installed (v1.20.2)

## 🔍 Steps to Fix

### 1. **Restart Cursor Completely**
- Close all Cursor windows
- Wait 5 seconds
- Reopen Cursor
- Wait for MCP servers to initialize (check bottom status bar)

### 2. **Check MCP Server Status in Cursor**
- Look at bottom status bar for MCP server status
- Should show "perplexity-chat" if connected
- If it shows an error, click to see details

### 3. **Verify Server Can Start**
Run this to test if server starts without errors:
```powershell
cd C:\Users\HP\mcp\perplexity-chat
$env:PPLX_API_KEY="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"
node index.mjs
```
(It will hang waiting for stdio - this is normal. Press Ctrl+C to exit)

### 4. **Check Cursor Logs**
- Open Cursor Developer Tools (Help > Toggle Developer Tools)
- Check Console tab for MCP errors
- Look for "perplexity-chat" in error messages

### 5. **Alternative: Use Environment Variable**
Instead of putting API key in mcp.json, set it in Windows:

**PowerShell (User-level, persistent):**
```powershell
[System.Environment]::SetEnvironmentVariable("PPLX_API_KEY","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","User")
```

Then update mcp.json to remove the env key:
```json
"env": {}
```

### 6. **Manual Server Test**
If all else fails, test the server manually:
```powershell
cd C:\Users\HP\mcp\perplexity-chat
node test-api.js
```

## 🐛 Common Issues

### Issue: "PPLX_API_KEY not set"
**Fix:** API key must be in `env` block OR Windows environment variable

### Issue: "Cannot find module"
**Fix:** Run `npm install` in `C:\Users\HP\mcp\perplexity-chat\`

### Issue: "Permission denied"
**Fix:** Run Cursor as Administrator (right-click > Run as Administrator)

### Issue: Server starts but tool not available
**Fix:** Restart Cursor completely (close all windows)

## 📝 Current Configuration

**Server Location:** `C:\Users\HP\mcp\perplexity-chat\index.mjs`
**Node Path:** `C:/Program Files/nodejs/node.exe` ✅ Verified
**API Key:** Set in mcp.json env block ✅ Working
**SDK Version:** @modelcontextprotocol/sdk@1.20.2 ✅ Installed

## ✅ Next Steps

1. **Restart Cursor** (most important!)
2. Check MCP status in bottom bar
3. Try asking: "Use Perplexity to search for latest React 19 features"
4. If still not working, check Cursor Developer Tools console

