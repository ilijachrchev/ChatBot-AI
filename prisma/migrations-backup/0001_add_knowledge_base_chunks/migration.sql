-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable: Add errorMessage to KnowledgeBaseFile
ALTER TABLE "KnowledgeBaseFile" ADD COLUMN "errorMessage" TEXT;

-- CreateTable: KnowledgeBaseChunk
CREATE TABLE "KnowledgeBaseChunk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "userId" UUID NOT NULL,
    "domainId" UUID,
    "fileId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeBaseChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeBaseChunk_userId_idx" ON "KnowledgeBaseChunk"("userId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseChunk_domainId_idx" ON "KnowledgeBaseChunk"("domainId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseChunk_fileId_idx" ON "KnowledgeBaseChunk"("fileId");

-- CreateIndex: Vector similarity search index using HNSW
CREATE INDEX "knowledge_base_chunk_embedding_idx" ON "KnowledgeBaseChunk" 
USING hnsw (embedding vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "KnowledgeBaseChunk" ADD CONSTRAINT "KnowledgeBaseChunk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseChunk" ADD CONSTRAINT "KnowledgeBaseChunk_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseChunk" ADD CONSTRAINT "KnowledgeBaseChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "KnowledgeBaseFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterEnum: Add FAILED to KnowledgeBaseFileStatus
ALTER TYPE "KnowledgeBaseFileStatus" ADD VALUE 'FAILED';

