# Security notes

- The shipped app is a static client-side PWA. It has no backend, API routes, accounts, authentication, or server-side mutating endpoints; endpoint authorisation and roles are therefore not applicable to this architecture.
- Invoice and profile data are stored unencrypted in the current browser's `localStorage` under `billflow.v1`. Anyone with access to that browser profile can read or change the data. Do not use shared devices for confidential client data; export backups regularly.
- No API keys, passwords, or production secrets are required. `.env.example` documents the optional local preview server settings only.
- User-entered values are HTML-escaped before rendering. Imported backups are structurally validated and normalised. Keep dependencies at zero unless a reviewed need arises.
- Serve production deployments over HTTPS. Service workers require a secure origin (HTTPS or localhost).

## Reporting

Do not put private invoice data or credentials in public issue reports. The project currently has no dedicated security contact or server-side account system.
