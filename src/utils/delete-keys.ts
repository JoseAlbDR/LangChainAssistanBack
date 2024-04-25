import * as fs from 'fs';

// Leer el contenido del archivo .env
let envContent = fs.readFileSync('.env', 'utf-8');

// Eliminar la SECRET_KEY e IV del contenido
envContent = envContent.replace(/^SECRET_KEY=.*\n?/m, '');
envContent = envContent.replace(/^IV=.*\n?/m, '');

// Escribir el contenido modificado de vuelta al archivo .env
fs.writeFileSync('.env', envContent);

console.log(
  'SECRET_KEY y IV eliminados del archivo .env después de la construcción',
);
