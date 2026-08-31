# AluSathi Security Review

**Reviewed:** 31 August 2026

**Scope:** active React farmer flow, FastAPI image endpoint and offline queue

## Controls verified

| Area | Control |
| --- | --- |
| Upload size | Server reads at most 8 MB plus one byte and rejects larger files |
| Upload type | JPEG, PNG and WebP allowlist; SVG is rejected |
| File content | Pillow decodes and verifies the image instead of trusting MIME type |
| Image bounds | Shortest side must be at least 128 px; longest side no more than 8,000 px |
| Decompression safety | Malformed files and Pillow decompression-bomb errors fail closed |
| Abuse control | Per-client request limit and two concurrent inference slots |
| Error handling | Generic server error response; no stack trace returned to farmers |
| Response headers | CSP, HSTS, frame denial, no-sniff, no-referrer and no-store |
| Privacy | Uploaded images are processed in memory and are not added to training data |
| Offline privacy | Pending images stay in local IndexedDB until successful synchronization |
| Model safety | Field-validation lock hides disease names and confidence by default |
| Advice safety | No pesticide product or dosage is generated; expert confirmation is required |

## Automated evidence

- Spoofed JPEG content returns HTTP 400.
- SVG MIME type returns HTTP 415.
- A valid image returns `unknown` while field validation is false.
- Model and policy unit suite passes.
- Production dependency audit reports zero known production vulnerabilities.

## Residual risks

- The in-memory per-client rate-limit table is suitable for a single demo process, not a distributed public service.
- Production deployment still needs a trusted reverse proxy, HTTPS termination, centralized rate limiting, request logging without image contents, uptime monitoring and an incident process.
- IndexedDB is device-local, not encrypted application storage. Farmers should use a device they control.
- The three-class model cannot prove that an upload contains a potato leaf; the field-validation lock currently contains this risk.

## Release decision

Suitable for a controlled competition demo. Not approved for unsupervised public field diagnosis.
