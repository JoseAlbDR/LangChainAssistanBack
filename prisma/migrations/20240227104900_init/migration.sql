CREATE EXTENSION IF NOT EXISTS vector;
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "aup";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "aup"."user_roles" AS ENUM ('adopter', 'shelter', 'admin');

-- CreateEnum
CREATE TYPE "aup"."gender_enum" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "aup"."adoption_publish_status" AS ENUM ('pending', 'rejected', 'published');

-- CreateEnum
CREATE TYPE "aup"."social_media_enum" AS ENUM ('facebook', 'xtweet', 'instagram');

-- CreateEnum
CREATE TYPE "aup"."animal_size" AS ENUM ('small', 'medium', 'big', 'very_big');

-- CreateEnum
CREATE TYPE "aup"."legal_forms" AS ENUM ('association', 'public_utility_association', 'autonomous_foundation', 'national_foundation', 'other');

-- CreateEnum
CREATE TYPE "aup"."facilities" AS ENUM ('foster_homes', 'municipal_or_public_facilities', 'leased_facilities', 'owned_facilities', 'private_residences');

-- CreateEnum
CREATE TYPE "aup"."status_pet" AS ENUM ('adopted', 'fostered', 'reserved', 'awaiting_home');

-- CreateEnum
CREATE TYPE "aup"."molting" AS ENUM ('light', 'moderate', 'heavy', 'no_shedding');

-- CreateEnum
CREATE TYPE "aup"."energy" AS ENUM ('light', 'moderate', 'high');

-- CreateEnum
CREATE TYPE "aup"."potential" AS ENUM ('none', 'low', 'moderate', 'high', 'excessive');

-- CreateEnum
CREATE TYPE "aup"."animal_type" AS ENUM ('cat', 'dog');

-- CreateTable
CREATE TABLE "aup"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "emailValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT NOT NULL DEFAULT 'avatar.png',
    "role" "aup"."user_roles" NOT NULL,
    "verificationToken" TEXT NOT NULL DEFAULT '',
    "passwordToken" TEXT NOT NULL DEFAULT '',
    "dni" TEXT,
    "firstName" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastName" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queue" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isReadAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Token" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Shelter" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "cif" TEXT NOT NULL,
    "facilities" "aup"."facilities",
    "images" TEXT[],
    "legalForms" "aup"."legal_forms",
    "ownVet" BOOLEAN,
    "veterinaryFacilities" BOOLEAN,

    CONSTRAINT "Shelter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."ContactInfo" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."SocialMedia" (
    "name" "aup"."social_media_enum" NOT NULL,
    "url" TEXT NOT NULL,
    "shelterId" TEXT NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("shelterId","name")
);

-- CreateTable
CREATE TABLE "aup"."City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Animal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "age" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "breed" TEXT NOT NULL,
    "size" "aup"."animal_size" NOT NULL,
    "publishStatus" "aup"."adoption_publish_status" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adoptedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "images" TEXT[],
    "easyTrain" BOOLEAN NOT NULL,
    "energyLevel" "aup"."energy" NOT NULL,
    "moltingAmount" "aup"."molting" NOT NULL,
    "status" "aup"."status_pet" NOT NULL DEFAULT 'awaiting_home',
    "type" "aup"."animal_type" NOT NULL,
    "gender" "aup"."gender_enum" NOT NULL,
    "numFavs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Dog" (
    "id" TEXT NOT NULL,
    "departmentAdapted" BOOLEAN NOT NULL,
    "droolingPotential" "aup"."potential" NOT NULL,
    "bark" "aup"."potential" NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."Cat" (
    "id" TEXT NOT NULL,
    "playLevel" "aup"."potential" NOT NULL,
    "kidsFriendly" BOOLEAN NOT NULL,
    "scratchPotential" "aup"."potential" NOT NULL,
    "toiletTrained" BOOLEAN NOT NULL,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vector"."Documents" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aup"."_userFav" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "aup"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "aup"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Token_userId_key" ON "aup"."Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_slug_key" ON "aup"."Animal"("slug");

-- CreateIndex
CREATE INDEX "Animal_gender_idx" ON "aup"."Animal"("gender");

-- CreateIndex
CREATE INDEX "Animal_name_idx" ON "aup"."Animal"("name");

-- CreateIndex
CREATE INDEX "Animal_age_idx" ON "aup"."Animal"("age");

-- CreateIndex
CREATE INDEX "Animal_size_idx" ON "aup"."Animal"("size");

-- CreateIndex
CREATE INDEX "Animal_createdBy_idx" ON "aup"."Animal"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "_userFav_AB_unique" ON "aup"."_userFav"("A", "B");

-- CreateIndex
CREATE INDEX "_userFav_B_index" ON "aup"."_userFav"("B");

-- AddForeignKey
ALTER TABLE "aup"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aup"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aup"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Shelter" ADD CONSTRAINT "Shelter_id_fkey" FOREIGN KEY ("id") REFERENCES "aup"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Admin" ADD CONSTRAINT "Admin_id_fkey" FOREIGN KEY ("id") REFERENCES "aup"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."ContactInfo" ADD CONSTRAINT "ContactInfo_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "aup"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."ContactInfo" ADD CONSTRAINT "ContactInfo_id_fkey" FOREIGN KEY ("id") REFERENCES "aup"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."SocialMedia" ADD CONSTRAINT "SocialMedia_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "aup"."Shelter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Animal" ADD CONSTRAINT "Animal_adoptedBy_fkey" FOREIGN KEY ("adoptedBy") REFERENCES "aup"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Animal" ADD CONSTRAINT "Animal_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "aup"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Animal" ADD CONSTRAINT "Animal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "aup"."Shelter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Dog" ADD CONSTRAINT "Dog_id_fkey" FOREIGN KEY ("id") REFERENCES "aup"."Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."Cat" ADD CONSTRAINT "Cat_id_fkey" FOREIGN KEY ("id") REFERENCES "aup"."Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."_userFav" ADD CONSTRAINT "_userFav_A_fkey" FOREIGN KEY ("A") REFERENCES "aup"."Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aup"."_userFav" ADD CONSTRAINT "_userFav_B_fkey" FOREIGN KEY ("B") REFERENCES "aup"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
