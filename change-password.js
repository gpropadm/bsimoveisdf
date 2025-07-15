const bcrypt = require('bcryptjs');

  const newPassword = 'admin123';
  const hash = bcrypt.hashSync(newPassword, 12);

  console.log('Hash para admin123:', hash);
  console.log('\nSQL Command:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 
  'admin@faimoveis.com.br';`);