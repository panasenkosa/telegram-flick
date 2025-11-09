# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Telegram Bot                         │
│                        (Telegraf)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐   ┌─────────┐   ┌─────────┐
    │Commands│   │Messages │   │Payments │
    │Handlers│   │Handlers │   │Handlers │
    └────┬───┘   └────┬────┘   └────┬────┘
         │            │             │
         └────────────┼─────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌────────┐   ┌────────┐   ┌─────────┐
    │Database│   │ MinIO  │   │AI APIs  │
    │(Prisma)│   │Storage │   │OpenAI/  │
    │        │   │        │   │Replicate│
    └────────┘   └────────┘   └─────────┘
```

## Components

### 1. Bot Layer (`src/bot/`)
- **index.ts** - Bot initialization and routing
- **handlers/** - Command and message handlers
- **middlewares/** - Logging, error handling

### 2. Service Layer (`src/services/`)
- **database.ts** - Database operations
- **minio.ts** - File storage operations
- **openai.ts** - Image generation
- **replicate.ts** - Video generation
- **error-handler.ts** - Error management

### 3. Configuration (`src/config/`)
- **env.ts** - Environment validation

### 4. Utilities (`src/utils/`)
- **logger.ts** - Logging utilities

## Data Flow

### Photo Upload Flow
```
User sends photo
     │
     ▼
Telegram Bot receives photo
     │
     ▼
Download from Telegram
     │
     ▼
Upload to MinIO
     │
     ▼
Save URL to database
     │
     ▼
Update session state
```

### Video Generation Flow
```
User sends 2 photos
     │
     ▼
Photos uploaded to MinIO
     │
     ▼
GPT-Image combines photos
     │
     ▼
Combined image uploaded to MinIO
     │
     ▼
Replicate generates video
     │
     ▼
Video downloaded
     │
     ▼
Video uploaded to MinIO
     │
     ▼
Video sent to user
```

### Payment Flow
```
User clicks /buy
     │
     ▼
Select package
     │
     ▼
Generate invoice
     │
     ▼
Telegram payment UI
     │
     ▼
Pre-checkout validation
     │
     ▼
Payment successful
     │
     ▼
Update user balance
     │
     ▼
Record payment
```

## State Management

### User States
- **IDLE** - No active operations
- **WAITING_FOR_PHOTOS** - Collecting photos
- **PROCESSING** - Generation in progress

State transitions are stored in `UserSession` table.

## Database Schema

### Core Tables
- **users** - User information and balances
- **generations** - Generation history and status
- **payments** - Payment records
- **user_sessions** - Active user states

## File Storage Structure

```
MinIO Bucket: telegram-flick
├── photos/
│   └── {userId}/
│       ├── {timestamp}_{fileId}.jpg
│       └── ...
├── combined/
│   └── {userId}/
│       ├── {timestamp}_romantic.jpg
│       └── ...
└── videos/
    └── {userId}/
        ├── {timestamp}_romantic.mp4
        └── ...
```

## Security Considerations

1. **Environment Variables**
   - All secrets in environment variables
   - Validated with Zod

2. **User Data**
   - BigInt for Telegram IDs
   - No sensitive data stored
   - Files stored with presigned URLs

3. **Payment**
   - Using Telegram Stars (secure)
   - Pre-checkout validation
   - Payment record tracking

4. **File Access**
   - Presigned URLs (time-limited)
   - Per-user directories
   - No public access

## Scalability

### Current Limitations
- Single instance
- Synchronous processing
- Local file processing

### Future Improvements
1. **Horizontal Scaling**
   - Load balancer
   - Multiple bot instances
   - Shared database

2. **Async Processing**
   - Queue system (Bull/BullMQ)
   - Worker processes
   - Job status tracking

3. **Caching**
   - Redis for sessions
   - CDN for files
   - Result caching

4. **Monitoring**
   - Prometheus metrics
   - Error tracking (Sentry)
   - Performance monitoring

## Error Handling Strategy

1. **User-facing errors**
   - Friendly error messages
   - Recovery suggestions
   - /cancel option

2. **Internal errors**
   - Detailed logging
   - Error tracking
   - Graceful degradation

3. **External API errors**
   - Retry logic
   - Timeout handling
   - Fallback options

## Deployment Architecture

### Development
```
Developer Machine
├── Node.js process
├── Local PostgreSQL
└── Local MinIO
```

### Production (Docker Compose)
```
Docker Host
├── Bot Container
├── PostgreSQL Container
├── MinIO Container
└── Docker Network
```

### Production (Kubernetes - Future)
```
Kubernetes Cluster
├── Bot Deployment (multiple replicas)
├── PostgreSQL StatefulSet
├── MinIO StatefulSet
├── Redis StatefulSet (for caching)
└── Ingress/Load Balancer
```

## Performance Considerations

1. **Database**
   - Indexes on userId fields
   - Connection pooling
   - Query optimization

2. **File Storage**
   - Presigned URLs
   - Direct upload/download
   - Temporary file cleanup

3. **API Calls**
   - Timeout configuration
   - Rate limiting awareness
   - Error retry logic

4. **Memory Management**
   - Stream processing for large files
   - Temporary file cleanup
   - Buffer size limits

## Technology Choices

### Why Telegraf?
- Modern, TypeScript-friendly
- Active development
- Good documentation
- Middleware support

### Why Prisma?
- Type-safe queries
- Great DX
- Schema migrations
- Multi-database support

### Why MinIO?
- S3-compatible
- Self-hosted
- Good performance
- Easy to scale

### Why PostgreSQL?
- Reliable
- Feature-rich
- Great with Prisma
- JSON support

