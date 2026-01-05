const bcrypt = require('bcrypt');

// Generate password hashes
async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  
  console.log('Admin password (admin123):');
  console.log(adminHash);
  console.log('\nUser password (user123):');
  console.log(userHash);
  
  console.log('\n\n=== SQL UPDATE STATEMENTS ===\n');
  console.log(`UPDATE user SET password = '${adminHash}' WHERE username = 'admin';`);
  console.log(`UPDATE user SET password = '${userHash}' WHERE username = 'user';`);
}

generateHashes();