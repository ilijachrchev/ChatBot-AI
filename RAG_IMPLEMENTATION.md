# RAG Pipeline Implementation Summary

## Overview
This document summarizes the complete RAG (Retrieval-Augmented Generation) pipeline implementation for the SendWise-AI chatbot.

## Database Changes

### Prisma Schema Updates
1. **KnowledgeBaseChunk Model**: New model for storing document chunks with vector embeddings
   - Fields: id, content, embedding (vector(1536)), userId, domainId, fileId, chunkIndex, createdAt
   - Indexes: userId, domainId, fileId, and HNSW vector index for similarity search

2. **KnowledgeBaseFile Updates**:
   - Added `errorMessage` field (Text, nullable) for storing ingestion errors
   - Added `FAILED` status to `KnowledgeBaseFileStatus` enum
   - Added relation to `KnowledgeBaseChunk`

### Migration Required
Run the migration file: `prisma/migrations/0001_add_knowledge_base_chunks/migration.sql`

**Important**: This migration:
- Enables the `vector` extension (pgvector)
- Creates the `KnowledgeBaseChunk` table
- Adds HNSW index for vector similarity search
- Adds `FAILED` status to enum

To apply:
```bash
npx prisma migrate deploy
# OR for development:
npx prisma migrate dev
```

## New Dependencies
- `pdf-parse`: For extracting text from PDF files
- `mammoth`: For extracting text from DOCX files

Install with:
```bash
npm install pdf-parse mammoth
```

## Environment Variables
No new environment variables required. Uses existing `OPEN_AI_KEY` for:
- Embedding generation (text-embedding-3-small model)
- Chat completions (gpt-3.5-turbo)

## Implementation Details

### 1. Ingestion Pipeline (`src/lib/knowledge-base/ingest.ts`)
- **Text Extraction**: Supports PDF, DOCX, and TXT files
- **Text Normalization**: Cleans whitespace and normalizes text
- **Chunking**: 
  - Chunk size: ~1000 tokens (4000 characters)
  - Overlap: ~150 tokens (600 characters)
  - Sentence-aware chunking for better context preservation
- **Embedding**: Uses OpenAI `text-embedding-3-small` (1536 dimensions)
- **Storage**: Stores chunks with embeddings in PostgreSQL using pgvector

### 2. Retrieval Pipeline (`src/lib/knowledge-base/retrieve.ts`)
- **Query Embedding**: Creates embedding for user queries
- **Vector Search**: Uses cosine similarity with HNSW index
- **Scoping**: 
  - Filters by userId (required)
  - Filters by domainId (when provided)
  - Only includes chunks from files with status `READY`
- **Context Building**: Formats retrieved chunks with citations `[KB:filename#chunkIndex]`
- **Context Limits**: Maximum 4000 characters to avoid token explosion

### 3. Chat Integration (`src/actions/bot/index.ts`)
- Retrieves knowledge base context for each user message
- Injects context into system message with instructions
- Handles both customer and new customer scenarios
- Context is added before user message in the conversation

### 4. Upload Flow (`src/app/api/knowledge-base/upload/route.ts`)
- **Stricter Validation**: Both MIME type and file extension must match
- **Background Processing**: Triggers ingestion asynchronously (fire-and-forget)
- **Status Management**: Files start as `PROCESSING`, update to `READY` or `FAILED`

### 5. Delete Flow (`src/actions/knowledge-base/index.ts`)
- Deletes all chunks associated with the file
- Removes physical file from disk
- Cascades through database relations

### 6. UI Updates (`src/components/knowledge-base/index.tsx`)
- Shows `PROCESSING`, `FAILED`, `READY`, and `DISABLED` statuses with color coding
- **Reprocess Button**: Appears for `FAILED` files to retry ingestion
- Status updates automatically refresh the file list

## Security Considerations

### File Storage
- Files are currently stored in `/public/uploads/knowledge-base/`
- **Recommendation**: Move to authenticated download route in future
- Current implementation exposes files via public URLs

### File Validation
- Stricter validation: Both MIME type AND file extension must match allowed types
- File size limit: 10MB per file

### Multi-Tenant Isolation
- All queries scoped by `userId` (required)
- Optional `domainId` scoping for domain-specific knowledge bases
- `DISABLED` files are excluded from retrieval

## Testing Checklist

### Basic Functionality
- [ ] Upload a TXT file with a unique phrase
- [ ] Wait for processing to complete (check status)
- [ ] Ask chatbot a question about the phrase
- [ ] Verify chatbot uses the knowledge base content

### Status Management
- [ ] Upload file and verify it shows `PROCESSING` status
- [ ] Wait for completion and verify status changes to `READY`
- [ ] Disable a file and verify chatbot stops using it
- [ ] Re-enable file and verify chatbot uses it again

### Error Handling
- [ ] Upload an invalid/corrupted file
- [ ] Verify status changes to `FAILED`
- [ ] Use reprocess button to retry
- [ ] Verify error message is stored

### File Deletion
- [ ] Delete a file
- [ ] Verify chunks are removed from database
- [ ] Verify physical file is removed from disk

### Multi-Format Support
- [ ] Upload and process PDF file
- [ ] Upload and process DOCX file
- [ ] Upload and process TXT file
- [ ] Verify all extract text correctly

### Domain Scoping
- [ ] Upload file with domainId
- [ ] Verify chunks are scoped to that domain
- [ ] Test retrieval with and without domainId

## Known Limitations

1. **Background Processing**: Uses fire-and-forget async calls. For production, consider a proper job queue (e.g., Bull, BullMQ, or similar).

2. **File Storage**: Files are in `/public` directory. Consider moving to:
   - Authenticated download route
   - Cloud storage (S3, etc.)
   - Private file system location

3. **Chunking Strategy**: Current chunking is character-based with token estimation. For better results, consider:
   - Token-aware chunking using tiktoken
   - Semantic chunking
   - Document structure awareness

4. **Embedding Model**: Using `text-embedding-3-small` for cost efficiency. For better accuracy, consider:
   - `text-embedding-3-large` (3072 dimensions)
   - `text-embedding-ada-002` (legacy, 1536 dimensions)

5. **Vector Index**: Using HNSW index. May need tuning based on data volume:
   - Adjust `m` and `ef_construction` parameters for HNSW
   - Consider IVFFlat for smaller datasets

## Performance Considerations

- **Embedding Generation**: ~1-2 seconds per chunk (depends on OpenAI API)
- **Vector Search**: HNSW index provides fast similarity search even with large datasets
- **Context Injection**: Adds ~100-500ms to chat response time depending on retrieval

## Future Enhancements

1. **Job Queue**: Implement proper background job processing
2. **Incremental Updates**: Support updating chunks when files change
3. **Metadata**: Add metadata extraction (author, date, etc.)
4. **Hybrid Search**: Combine vector search with keyword search
5. **Re-ranking**: Use cross-encoder for better result ranking
6. **Caching**: Cache embeddings and retrieval results
7. **Analytics**: Track which chunks are most useful

## Troubleshooting

### Migration Issues
If pgvector extension fails:
```sql
-- Check if extension exists
SELECT * FROM pg_extension WHERE extname = 'vector';

-- If not, install manually
CREATE EXTENSION vector;
```

### Embedding Issues
- Verify `OPEN_AI_KEY` is set correctly
- Check OpenAI API rate limits
- Verify network connectivity

### Retrieval Issues
- Check that chunks exist: `SELECT COUNT(*) FROM "KnowledgeBaseChunk"`
- Verify file status is `READY`
- Check vector index exists: `\d+ "KnowledgeBaseChunk"`

## Support

For issues or questions, refer to:
- Prisma documentation: https://www.prisma.io/docs
- pgvector documentation: https://github.com/pgvector/pgvector
- OpenAI embeddings: https://platform.openai.com/docs/guides/embeddings

