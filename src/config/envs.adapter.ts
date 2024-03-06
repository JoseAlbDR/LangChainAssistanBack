import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
  //* Database
  DATABASE_URL: get('PORT')
    .default('postgresql://user:secret@localhost:5432/vector-db')
    .asString(),
  DB_PASSWORD: get('DB_PASSWORD').default('secret').asString(),
  DB_USER: get('DB_USER').default('user').asString(),
  DB_NAME: get('DB_NAME').default('vector-db').asString(),

  //* OPENAI API KEY
  OPENAI_API_KEY: get('OPENAI_API_KEY').asString(),

  //* DOCUMENT INFO
  DOCUMENT_PATH: get('DOCUMENT_PATH').default('./data/').asString(),
  // DOCUMENT_NAME: get('DOCUMENT_NAME').default('document').asString(),
  // DOCUMENT_EXTENSION: get('DOCUMENT_EXTENSION')
  //   .default('.txt')
  //   .asEnum(['.txt', '.pdf']),

  //* APP PORT
  PORT: get('PORT').default(3000).asPortNumber(),
};
