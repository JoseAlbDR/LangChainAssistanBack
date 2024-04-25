import * as fs from 'fs';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const secretKey = crypto.randomBytes(32).toString('hex');

const iv = crypto.randomBytes(16).toString('hex');

const envContent = `SECRET_KEY=${secretKey}\nIV=${iv}\n`;

fs.appendFileSync('.env', envContent);

console.log('SECRET_KEY y IV generados y guardados en el archivo .env');
