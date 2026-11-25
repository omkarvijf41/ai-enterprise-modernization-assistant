# Security and responsible-use notes

## Data classification
Use synthetic or explicitly approved sanitized project descriptions only. Do not submit credentials, tokens, customer data, source code, internal architecture diagrams or regulated data.

## Controls in this MVP
- Helmet security headers
- Explicit CORS origin allowlist
- JSON request size limit
- Zod input validation and bounded fields
- No persistence of submitted content
- No shell execution, repository access or autonomous code changes
- Provider error details are kept out of the API response

## Required before production
- Enterprise SSO/OIDC, RBAC and tenant isolation
- TLS, private networking, managed identity and secret vault
- Request throttling, audit events, retention/deletion policy
- Prompt-injection defenses and separation of retrieved data from instructions
- Approved SAST/SCA/secrets/container scanning
- Human approval for code changes and infrastructure actions
- Model output validation, evaluation and abuse monitoring

AI-generated findings are advisory and must not be represented as confirmed CVEs unless matched to trusted scanner output.
