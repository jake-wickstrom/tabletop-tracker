# SERVICES

This file documents all third-party services and tools used in this project, including their purpose, scope, and integration details.

Each service includes a `MCP:` field indicating whether it is available to AI tools via Model Context Protocol (MCP), such as in Cursor.

---

## Source Control

**Service**: GitHub  
**Purpose**: Source code management and collaboration  
**Repository**: https://github.com/your-username/your-repo  
**MCP**: Enabled  
**Token Location**: `.cursor/mcp.json`  
**AI Usage**: Use for generating CI configs, automating repo actions, and referencing project structure.

---

## Design

**Service**: Figma  
**Purpose**: UI/UX design and prototyping  
**Project Link**: https://www.figma.com/file/your-file-id  
**MCP**: Not Enabled  
**AI Usage**: Reference manually. Embed design notes or screenshots in documentation or code comments if needed.

---

## Backend & Database

**Service**: Supabase  
**Purpose**: Postgres database, authentication, instant APIs, edge functions, realtime subscriptions, storage, and vector embeddings  
**URL**: https://supabase.com/  
**Project**: `tabletop-tracker`  
**MCP**: Not Enabled  
**AI Usage**: Use for database schema design, API generation, authentication setup, and backend service configuration.

---

## Hosting

**Service**: Vercel  
**Purpose**: Frontend hosting and deployment  
**Project**: `tabletop-tracker`  
**URL**: https://tabletop-tracker.vercel.app  
**MCP**: Enabled  
**Token Location**: `.cursor/mcp.json`  
**AI Usage**: Use to generate deployment configs, environment settings, and edge function routing.

---

## CI/CD

**Service**: GitHub Actions  
**Purpose**: Automated testing and deployment  
**Workflows**: `build.yml`, `deploy.yml`  
**MCP**: Enabled (via GitHub integration)  
**AI Usage**: Generate or modify workflows, configure build steps, set up matrix strategies.

---

## Analytics (Optional)

**Service**: [Your Analytics Tool]  
**Purpose**: Track usage metrics and performance  
**Status**: Not yet integrated  
**MCP**: Not Enabled  
**AI Usage**: Not applicable yet. Add context here once analytics integration is active.

---

## Secrets & Environment Variables

**Service**: Local `.env` & Vercel Environment  
**Purpose**: Secure configuration for API keys and service credentials  
**MCP**: Enabled (local `.env` is readable by Cursor if configured)  
**AI Usage**: Use when writing code that interacts with third-party APIs or when configuring environments for deployment.

---

## File Storage (Optional)

**Service**: [e.g., Cloudinary, AWS S3]  
**Purpose**: Hosting and retrieving media files  
**Status**: Planned  
**MCP**: Not Enabled  
**AI Usage**: Not applicable yet. Update once integration is complete.

---

## Monitoring & QA (Optional)

**Service**: [e.g., Sentry, Postman, Playwright]  
**Purpose**: Monitoring app health, testing, and debugging  
**Status**: Not currently in use  
**MCP**: Not Enabled  
**AI Usage**: Not applicable

---

## Notes for AI Context Use

- **MCP: Enabled** indicates the service is available for context-aware AI code generation or suggestions.
- Update this file whenever a service is added, removed, or integrated with MCP.
- Do **not** commit sensitive data. Tokens should be stored securely in `.env`, `.cursor/mcp.json`, or managed via the service provider’s dashboard.
