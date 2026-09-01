// Hostinger entry file — CommonJS (package.json uses "type": "module", so server.js cannot use require).
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

try {
  require('./dist/server.cjs');
} catch (error) {
  console.error('Failed to start EventHive:', error);
  process.exit(1);
}
