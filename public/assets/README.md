Permanent visual assets live here.

Structure:
- `branding/` = site logos and wordmarks
- `payments/` = payment method and gateway logos
- `categories/` = permanent category graphics and SVG illustrations

Payment brand files in `payments/` are stored locally so the storefront loads them
from the project instead of depending on remote URLs at runtime.

Category SVGs also live in this asset system now, rather than under `public/images/`.

Keep user uploads out of this directory.
User-generated files belong in `public/uploads/`.

Existing product/content art can remain in `public/images/` until we move it
intentionally in a separate cleanup pass.
