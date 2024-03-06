-- CreateTable
CREATE TABLE "ChatConfig" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo-0125',
    "openAIApiKey" TEXT NOT NULL DEFAULT '',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 250,

    CONSTRAINT "ChatConfig_pkey" PRIMARY KEY ("id")
);
