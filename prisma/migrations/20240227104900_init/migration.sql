CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "Documents" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

