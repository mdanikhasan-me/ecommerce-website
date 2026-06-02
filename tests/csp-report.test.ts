import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/security/csp-report/route';
import {
  MAX_CSP_REPORT_BODY_BYTES,
  sanitizeCspReportPayload,
  sanitizeCspReportUrl,
} from '@/backend/security/csp-report';

async function withEnvValue<T>(
  key: string,
  value: string | undefined,
  callback: () => Promise<T>,
): Promise<T> {
  const previous = process.env[key];

  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }

  try {
    return await callback();
  } finally {
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  }
}

function createCspReportRequest(body: string, contentType = 'application/csp-report') {
  return new NextRequest('http://localhost:3000/api/security/csp-report', {
    method: 'POST',
    headers: {
      'content-type': contentType,
    },
    body,
  });
}

test('sanitizeCspReportUrl strips query strings and fragments', () => {
  assert.equal(
    sanitizeCspReportUrl('https://boilabin.com/account/profile?token=SECRET#section'),
    'https://boilabin.com/account/profile',
  );
  assert.equal(
    sanitizeCspReportUrl('http://localhost:3000/cart?email=user@example.test#hash'),
    'http://localhost:3000/cart',
  );
});

test('sanitizeCspReportPayload keeps only capped sanitized report fields', () => {
  const sanitized = sanitizeCspReportPayload({
    'csp-report': {
      'document-uri': 'https://boilabin.com/checkout?token=SECRET#step',
      'blocked-uri': 'https://cdn.example.test/script.js?session=SECRET#frag',
      'source-file': 'https://boilabin.com/_next/static/chunk.js?secret=SECRET',
      'violated-directive': 'script-src-elem',
      'effective-directive': 'script-src-elem',
      'original-policy': 'default-src '.repeat(80),
      'status-code': 200,
      'line-number': 12,
      'column-number': 34,
      cookie: 'session=SECRET',
      authorization: 'Bearer SECRET',
      'script-sample': 'SECRET inline code',
    },
  });

  assert.deepEqual(sanitized, {
    'document-uri': 'https://boilabin.com/checkout',
    'blocked-uri': 'https://cdn.example.test/script.js',
    'source-file': 'https://boilabin.com/_next/static/chunk.js',
    'violated-directive': 'script-src-elem',
    'effective-directive': 'script-src-elem',
    'original-policy': 'default-src '.repeat(80).slice(0, 240),
    'status-code': 200,
    'line-number': 12,
    'column-number': 34,
  });

  const serialized = JSON.stringify(sanitized);
  assert(!serialized.includes('SECRET'));
  assert(!serialized.includes('cookie'));
  assert(!serialized.includes('authorization'));
  assert(!serialized.includes('script-sample'));
});

test('CSP report endpoint is disabled by default', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', undefined, async () => {
    const previousWarn = console.warn;
    const warnings: unknown[][] = [];
    console.warn = (...args: unknown[]) => {
      warnings.push(args);
    };

    try {
      const response = await POST(
        createCspReportRequest(
          JSON.stringify({
            'csp-report': {
              'document-uri': 'https://boilabin.com/?token=SECRET',
            },
          }),
        ),
      );

      assert.equal(response.status, 404);
      assert.equal(warnings.length, 0);
    } finally {
      console.warn = previousWarn;
    }
  });
});

test('CSP report endpoint rejects unsupported content types when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const response = await POST(
      createCspReportRequest(
        JSON.stringify({
          'csp-report': {
            'document-uri': 'https://boilabin.com/',
          },
        }),
        'text/plain',
      ),
    );

    assert.equal(response.status, 415);
  });
});

test('CSP report endpoint safely rejects invalid JSON when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const response = await POST(createCspReportRequest('{invalid-json'));

    assert.equal(response.status, 400);
  });
});

test('CSP report endpoint rejects oversized report bodies when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const response = await POST(
      createCspReportRequest(
        JSON.stringify({
          'csp-report': {
            'document-uri': 'https://boilabin.com/',
            'original-policy': 'a'.repeat(MAX_CSP_REPORT_BODY_BYTES),
          },
        }),
      ),
    );

    assert.equal(response.status, 413);
  });
});

test('CSP report endpoint logs only sanitized report data when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const previousWarn = console.warn;
    const warnings: unknown[][] = [];
    console.warn = (...args: unknown[]) => {
      warnings.push(args);
    };

    try {
      const response = await POST(
        createCspReportRequest(
          JSON.stringify({
            'csp-report': {
              'document-uri': 'https://boilabin.com/account/profile?token=SECRET#hash',
              'blocked-uri': 'https://evil.example.test/script.js?email=user@example.test#frag',
              'source-file': 'https://boilabin.com/_next/static/chunk.js?secret=SECRET',
              'violated-directive': 'script-src-elem',
              'effective-directive': 'script-src-elem',
              'original-policy': 'script-src self',
              'status-code': 200,
              cookie: 'session=SECRET',
              authorization: 'Bearer SECRET',
              'script-sample': 'SECRET inline script',
            },
          }),
        ),
      );

      assert.equal(response.status, 204);
      assert.equal(warnings.length, 1);
      assert.equal(warnings[0][0], 'Security event');

      const logged = warnings[0][1] as Record<string, unknown>;
      assert.equal(logged.type, 'csp_violation_report');
      assert.equal(logged.route, '/api/security/csp-report');
      assert.equal(logged.method, 'POST');
      assert.equal(logged.statusCode, 204);
      assert.deepEqual(logged.metadata, {
        'document-uri': 'https://boilabin.com/account/profile',
        'blocked-uri': 'https://evil.example.test/script.js',
        'source-file': 'https://boilabin.com/_next/static/chunk.js',
        'violated-directive': 'script-src-elem',
        'effective-directive': 'script-src-elem',
        'original-policy': 'script-src self',
        'status-code': 200,
      });

      const serialized = JSON.stringify(warnings);
      assert(!serialized.includes('SECRET'));
      assert(!serialized.includes('token='));
      assert(!serialized.includes('email='));
      assert(!serialized.includes('#'));
      assert(!serialized.includes('cookie'));
      assert(!serialized.includes('authorization'));
      assert(!serialized.includes('script-sample'));
    } finally {
      console.warn = previousWarn;
    }
  });
});
