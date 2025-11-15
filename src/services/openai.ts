import OpenAI, { toFile } from 'openai';
import { env } from '../config/env.js';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { Readable } from 'stream';

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function createRomanticImage(
  photo1Url: string,
  photo2Url: string
): Promise<Buffer> {
  try {
    // Download both images
    const [photo1Response, photo2Response] = await Promise.all([
      axios.get(photo1Url, { responseType: 'arraybuffer' }),
      axios.get(photo2Url, { responseType: 'arraybuffer' }),
    ]);

    const photo1Buffer = Buffer.from(photo1Response.data);
    const photo2Buffer = Buffer.from(photo2Response.data);

    // Create temporary files
    const tmpDir = './tmp';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const photo1Path = path.join(tmpDir, `photo1_${Date.now()}.jpg`);
    const photo2Path = path.join(tmpDir, `photo2_${Date.now()}.jpg`);

    fs.writeFileSync(photo1Path, photo1Buffer);
    fs.writeFileSync(photo2Path, photo2Buffer);

    // Convert to OpenAI files
    const images = await Promise.all([
      toFile(fs.createReadStream(photo1Path), 'photo1.jpg', { type: 'image/jpeg' }),
      toFile(fs.createReadStream(photo2Path), 'photo2.jpg', { type: 'image/jpeg' }),
    ]);

    // Generate romantic image
    const prompt = `Create a beautiful romantic scene with these two people on a lovely date. 
    Place both people together in the same photo in a romantic setting - it could be a cozy restaurant, 
    a scenic outdoor location, or any romantic atmosphere. 
    
    CRITICAL REQUIREMENTS:
    - Both faces MUST be clearly visible and recognizable
    - Preserve all facial features exactly as they appear in the original photos
    - Show faces in close-up or medium shot so facial details are clear
    - The people should appear to be interacting romantically (holding hands, looking at each other, etc.)
    - Create a warm, romantic atmosphere with soft lighting
    - Make it look natural and realistic
    
    The final image should look like a genuine romantic couple photo with both people clearly recognizable.`;

    const response = await client.images.edit({
      model: 'gpt-image-1',
      //gpt-image-1-mini
      //dall-e-3
      //model: 'gpt-image-1-mini',
      image: images,
      prompt: prompt,
    });

    // Clean up temporary files
    fs.unlinkSync(photo1Path);
    fs.unlinkSync(photo2Path);

    if (!response.data || !response.data[0] || !response.data[0].b64_json) {
      throw new Error('No image data returned from OpenAI');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
    
    return imageBuffer;
  } catch (error) {
    console.error('Error creating romantic image:', error);
    throw new Error(`Failed to create romantic image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

