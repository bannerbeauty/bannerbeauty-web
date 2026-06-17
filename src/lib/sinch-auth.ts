import crypto from 'crypto';

const APP_KEY = process.env.SINCH_APPLICATION_KEY!;
const APP_SECRET = process.env.SINCH_APPLICATION_KEY_SECRET!;

export function getSinchHeaders(method: string, path: string, body: string, contentType: string): Record<string, string> {
  const timestamp = new Date().toISOString();

  // Step 1: MD5 hash of body, base64 encoded
  const bodyMd5 = body
    ? crypto.createHash('md5').update(Buffer.from(body, 'utf8')).digest('base64')
    : '';

  // Step 2: Build string to sign
  const canonicalizedHeaders = `x-timestamp:${timestamp}`;
  const stringToSign = [
    method.toUpperCase(),
    bodyMd5,
    contentType,
    canonicalizedHeaders,
    path,
  ].join('\n');

  // Step 3: HMAC-SHA256 sign using base64-decoded secret
  const secretBytes = Buffer.from(APP_SECRET, 'base64');
  const signature = crypto
    .createHmac('sha256', secretBytes)
    .update(Buffer.from(stringToSign, 'utf8'))
    .digest('base64');

  return {
    'Content-Type': contentType,
    'x-timestamp': timestamp,
    'Authorization': `Application ${APP_KEY}:${signature}`,
  };
}
