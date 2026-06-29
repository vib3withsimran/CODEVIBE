const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET or REFRESH_TOKEN_SECRET environment variable is not set.');
    process.exit(1);
  }
  console.warn('WARNING: JWT_SECRET or REFRESH_TOKEN_SECRET not set. Using insecure default for development.');
}

module.exports = {
  JWT_SECRET: JWT_SECRET || 'codevibe_default_secret',
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET || 'codevibe_default_refresh_secret',
  REFRESH_TOKEN_EXPIRES_IN,
};
