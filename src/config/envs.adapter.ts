import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
  DATABASE_URL: get('PORT')
    .default('postgresql://user:secret@localhost:5432/vector-db')
    .asString(),
  OPENAI_API_KEY: get('OPENAI_API_KEY').required().asString(),
  DB_PASSWORD: get('DB_PASSWORD').default('secret').asString(),
  DB_USER: get('DB_USER').default('user').asString(),
  DB_NAME: get('DB_NAME').default('vector-db').asString(),
  PORT: get('PORT').default(3000).asPortNumber(),
};
