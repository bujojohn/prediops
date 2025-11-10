# GitHub MCP Permissions Guide

## Required Token Scopes

To use GitHub MCP effectively, your Personal Access Token (PAT) needs the following permissions:

### For Classic PAT (Recommended for Full Access)
- **`repo`** - Full control of private repositories
  - ✅ Includes read/write access to code, issues, pull requests, metadata, etc.
  - ✅ Simplest option - grants all repository permissions

### For Fine-Grained PAT (More Secure, Granular Control)
Minimum required permissions for basic MCP operations:

- **Contents**: Read-only ✅
- **Metadata**: Read-only ✅
- **Issues**: Read-only ✅
- **Pull requests**: Read-only ✅

Additional permissions you might want (optional):
- **Actions**: Read-only (to view workflow runs)
- **Security events**: Read-only (for security alerts)

## How to Create/Update Your PAT

### Classic PAT
1. Go to: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Check the **`repo`** scope
4. Generate and copy the token

### Fine-Grained PAT
1. Go to: https://github.com/settings/tokens?type=beta
2. Click **Generate new token (fine-grained)**
3. Select the repository (or all repositories)
4. Under **Repository permissions**, set:
   - **Contents**: Read
   - **Metadata**: Read
   - **Issues**: Read
   - **Pull requests**: Read
5. Generate and copy the token

## Update Your MCP Configuration

Replace the token in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer YOUR_NEW_TOKEN_HERE"
      }
    }
  }
}
```

## Important Notes

⚠️ **The npm package `@modelcontextprotocol/server-github` is deprecated** (as of April 2025)
✅ **Use the official GitHub MCP server** at `https://api.githubcopilot.com/mcp/`

## After Updating Token

1. **Restart Cursor completely** (close all windows)
2. Verify MCP server shows green dot in Settings → Tools & Integrations → MCP Tools
3. Test with: "List my GitHub repositories" or "Show me recent issues"

## Troubleshooting

### "Not Found" Errors
- **Cause**: Token doesn't have required scopes or repository access
- **Solution**: 
  1. Regenerate token with `repo` scope (classic) or all required read permissions (fine-grained)
  2. Update token in `mcp.json`
  3. Restart Cursor

### Authentication Failures
- Verify token is valid: https://github.com/settings/tokens
- Check token hasn't expired
- Ensure token has access to the repository you're querying

### Private Repositories
- Classic PAT with `repo` scope can access all your repositories
- Fine-grained PAT must explicitly grant access to each repository or organization
