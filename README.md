

## Description

Backend for my ChatBot and Document Assistant Project

## Installation

```bash
git clone https://github.com/JoseAlbDR/LangChainAssistanBack.git
cd LangChainAssistanBack
```

### Start MongoDB and Postgres containers

```bash
docker compose up -d
```

### Copy .env.template in a .env file or rename it, fill empty variables with own data

```
DATABASE_URL=
OPENAI_API_KEY=
DB_PASSWORD=
DB_USER=
DB_NAME=vector-store
DOCUMENT_PATH=./data/

PORT=3000

LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=

MONGO_DB_URL=mongodb://127.0.0.1:27017/chatbot?directConnection=true
```

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

