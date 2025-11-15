import Replicate from 'replicate';
import { env } from '../config/env.js';
import axios from 'axios';

const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN
});

export async function generateVideoFromImage(imageUrl: string): Promise<string> {
  try {
    const input = {
      image: `${env.MINIO_ENDPOINT}:${env.MINIO_PORT}${imageUrl}`,
      prompt: `Close-up romantic scene: One person playfully and gently boops the other person's nose with their finger. 
      Both people are smiling and laughing in this sweet, affectionate moment. 
      The atmosphere is warm, friendly, and full of love and humor. 
      The camera captures this tender interaction with soft, romantic lighting. 
      The movement is smooth and natural - a gentle, playful nose tap followed by both people sharing a warm smile. 
      This is a heartwarming moment between two people who clearly care about each other.`,
      go_fast: true,
      num_frames: 81,
      resolution: '480p',
      sample_shift: 12,
      frames_per_second: 16,
      interpolate_output: true,
      lora_scale_transformer: 1,
      lora_scale_transformer_2: 1,
    };

    console.log('Starting video generation with Replicate...');
    
    const output = await replicate.run('wan-video/wan-2.2-i2v-fast', { input }) as any;
    
    console.log('Video generation completed!');
    
    // The output should be a URL to the video file
    let videoUrl: string;
    
    if (typeof output === 'string') {
      videoUrl = output;
    } else if (output && typeof output.url === 'function') {
      videoUrl = output.url();
    } else if (output && typeof output === 'object' && output.url) {
      videoUrl = output.url;
    } else if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    console.log('Video URL:', videoUrl);
    return videoUrl;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function downloadVideo(videoUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 120000, // 2 minutes timeout
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading video:', error);
    throw new Error(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

