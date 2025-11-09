# API Documentation

## Internal APIs

### Database Service

#### `ensureUser(userId, userData?)`
Creates or updates a user in the database.

**Parameters:**
- `userId` (bigint) - Telegram user ID
- `userData` (optional) - User information
  - `username` (string)
  - `firstName` (string)
  - `lastName` (string)

**Returns:** User object

#### `getUserSession(userId)`
Gets or creates a user session.

**Parameters:**
- `userId` (bigint) - Telegram user ID

**Returns:** UserSession object

#### `updateUserSession(userId, data)`
Updates user session data.

**Parameters:**
- `userId` (bigint) - Telegram user ID
- `data` (object) - Session data to update

**Returns:** Updated UserSession object

#### `canUserGenerate(userId)`
Checks if user can generate a video.

**Parameters:**
- `userId` (bigint) - Telegram user ID

**Returns:** 
```typescript
{
  canGenerate: boolean;
  reason?: string;
}
```

#### `decrementUserGenerations(userId)`
Decrements user's available generations.

**Parameters:**
- `userId` (bigint) - Telegram user ID

**Returns:** Updated User object

---

### MinIO Service

#### `getMinioClient()`
Gets MinIO client instance.

**Returns:** Minio.Client

#### `ensureBucket()`
Ensures the bucket exists, creates if not.

**Returns:** Promise<void>

#### `uploadFile(fileName, buffer, contentType?)`
Uploads a file to MinIO.

**Parameters:**
- `fileName` (string) - File name/path
- `buffer` (Buffer) - File content
- `contentType` (string, default: 'application/octet-stream') - MIME type

**Returns:** Promise<string> - Presigned URL

#### `uploadStream(fileName, stream, size, contentType?)`
Uploads a stream to MinIO.

**Parameters:**
- `fileName` (string) - File name/path
- `stream` (Readable) - File stream
- `size` (number) - Stream size
- `contentType` (string) - MIME type

**Returns:** Promise<string> - Presigned URL

#### `getFileUrl(fileName)`
Gets presigned URL for a file.

**Parameters:**
- `fileName` (string) - File name/path

**Returns:** Promise<string> - Presigned URL

---

### OpenAI Service

#### `createRomanticImage(photo1Url, photo2Url)`
Creates a romantic image from two photos using GPT-Image.

**Parameters:**
- `photo1Url` (string) - URL to first photo
- `photo2Url` (string) - URL to second photo

**Returns:** Promise<Buffer> - Generated image as buffer

---

### Replicate Service

#### `generateVideoFromImage(imageUrl)`
Generates a video from an image using Wan-Video.

**Parameters:**
- `imageUrl` (string) - URL to source image

**Returns:** Promise<string> - Video URL

#### `downloadVideo(videoUrl)`
Downloads a video from URL.

**Parameters:**
- `videoUrl` (string) - Video URL

**Returns:** Promise<Buffer> - Video content as buffer

---

## Database Schema

### User
```typescript
{
  id: bigint;
  username?: string;
  firstName?: string;
  lastName?: string;
  freeGenerations: number;
  paidGenerations: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Generation
```typescript
{
  id: string;
  userId: bigint;
  photo1Url?: string;
  photo2Url?: string;
  combinedImageUrl?: string;
  videoUrl?: string;
  status: GenerationStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### Payment
```typescript
{
  id: string;
  userId: bigint;
  amount: number;
  generationsAdded: number;
  telegramPaymentId: string;
  status: PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
}
```

### UserSession
```typescript
{
  id: string;
  userId: bigint;
  state: BotState;
  currentGenerationId?: string;
  photosReceived: number;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Enums

### GenerationStatus
- `PENDING` - Initial state
- `UPLOADING_PHOTOS` - Photos being uploaded
- `GENERATING_IMAGE` - Creating romantic image
- `GENERATING_VIDEO` - Creating video
- `COMPLETED` - Successfully completed
- `FAILED` - Failed with error

### PaymentStatus
- `PENDING` - Payment initiated
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

### BotState
- `IDLE` - No active operation
- `WAITING_FOR_PHOTOS` - Waiting for user to send photos
- `PROCESSING` - Generation in progress

---

## External APIs

### OpenAI GPT-Image API
Used for creating romantic scenes from photos.

**Model:** `gpt-image-1`

**Endpoint:** `client.images.edit()`

### Replicate Wan-Video API
Used for generating videos from images.

**Model:** `wan-video/wan-2.2-i2v-fast`

**Parameters:**
- `image` - Source image URL
- `prompt` - Video generation prompt
- `go_fast` - Speed mode
- `num_frames` - Number of frames (81)
- `resolution` - Video resolution (480p)
- `frames_per_second` - FPS (16)

---

## Error Handling

### BotError
Custom error class for user-facing errors.

```typescript
class BotError extends Error {
  constructor(
    message: string,
    userMessage: string,
    code?: string
  )
}
```

### Error Handler
```typescript
handleError(error: unknown, ctx?: Context): Promise<void>
```

Handles errors and sends user-friendly messages.

