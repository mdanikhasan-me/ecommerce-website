# Step 183 - Media Storage CDN Provider Boundary

## Scope

This loop clarified production storage/CDN boundaries without implementing any provider.

## Current Storage

Current uploaded media is written under local `public/uploads`.

This is acceptable for local development and pre-launch verification, but it is not a production multi-vendor storage plan.

## Future Storage Options

Possible future choices:

- S3-compatible object storage;
- Cloudflare R2;
- hosting-provider object storage;
- CDN-backed image service;
- managed image pipeline.

No provider was selected or configured in this batch.

## What Must Wait

Do not implement before provider decision:

- production bucket names;
- private credentials;
- CDN hostnames;
- signed upload URLs;
- lifecycle rules;
- cross-region replication;
- provider-specific SDK integration.

## Future Variant Storage

When variants are implemented, store a predictable set:

- original if approved and private;
- thumbnail;
- card;
- detail;
- zoom only when useful.

## Cache And Lifecycle Concerns

Future provider setup must handle:

- immutable file naming;
- CDN cache invalidation strategy;
- deleted product cleanup;
- orphaned upload cleanup;
- backup rules;
- cost monitoring.

## Migration Path

Local uploads can later be migrated by:

1. inventorying current `public/uploads`;
2. uploading files to object storage;
3. rewriting or mapping URLs;
4. preserving old paths until references are updated;
5. adding cleanup after verification.
