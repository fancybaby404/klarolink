// Simple script to generate bcrypt hashes for testing
// Run with: node generate_hash.js

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'password123';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log('Verification:', isValid ? 'SUCCESS' : 'FAILED');
    
    // Test with the existing hash from mock data
    const existingHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O';
    const isExistingValid = await bcrypt.compare(password, existingHash);
    console.log('Existing hash verification:', isExistingValid ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();
