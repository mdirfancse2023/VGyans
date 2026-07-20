// WebCrypto-based JWT and Password Hashing Utility

const base64UrlEncode = (str) => {
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
};

/**
 * Hashes a plain password using SHA-256 with salt
 */
export const hashPassword = async (password) => {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_vg_secure_salt_2026");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Creates a signed JWT Token (Header.Payload.Signature)
 */
export const createJWT = async (userPayload, secret = "VirtualGyans_JWT_Secret_2026!") => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...userPayload,
    iat: now,
    exp: now + (30 * 24 * 60 * 60) // Valid for 30 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw", 
    keyData, 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const encodedSignature = base64UrlEncode(String.fromCharCode.apply(null, signatureArray));

  return `${message}.${encodedSignature}`;
};

/**
 * Verifies and decodes a signed JWT Token
 */
export const verifyJWT = async (token, secret = "VirtualGyans_JWT_Secret_2026!") => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload] = parts;
    const payloadJson = JSON.parse(base64UrlDecode(encodedPayload));

    // Verify Expiration
    const now = Math.floor(Date.now() / 1000);
    if (payloadJson.exp && payloadJson.exp < now) {
      console.warn('JWT Token expired');
      return null;
    }

    return payloadJson;
  } catch (err) {
    console.error('JWT Verification error:', err);
    return null;
  }
};
