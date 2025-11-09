import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Input } from 'telegraf';
import { 
  canUserGenerate, 
  decrementUserGenerations, 
  getUserSession, 
  updateUserSession 
} from '../../services/database.js';
import { prisma } from '../../services/database.js';
import { uploadFile, ensureBucket } from '../../services/minio.js';
import { createRomanticImage } from '../../services/openai.js';
import { generateVideoFromImage, downloadVideo } from '../../services/replicate.js';
import axios from 'axios';
import { env } from '../../config/env.js';

export async function handleGenerate(ctx: Context) {
  if (!ctx.from) return;

  const userId = BigInt(ctx.from.id);

  // Check if user can generate
  const { canGenerate, reason } = await canUserGenerate(userId);
  
  if (!canGenerate) {
    await ctx.reply(`❌ ${reason}\n\nИспользуйте /buy для покупки генераций.`);
    return;
  }

  // Check if user already has an active session
  const session = await getUserSession(userId);
  
  if (session.state !== 'IDLE') {
    await ctx.reply(
      '⚠️ У вас уже есть активная генерация.\n\n' +
      'Используйте /cancel для отмены или дождитесь завершения.'
    );
    return;
  }

  // Create new generation record
  const generation = await prisma.generation.create({
    data: {
      userId,
      status: 'PENDING',
    },
  });

  // Update session
  await updateUserSession(userId, {
    state: 'WAITING_FOR_PHOTOS',
    currentGenerationId: generation.id,
    photosReceived: 0,
    data: { photoUrls: [] },
  });

  await ctx.reply(
    '📸 **Отлично! Начинаем создание видео.**\n\n' +
    'Пожалуйста, отправьте **2 фотографии** (по одной).\n\n' +
    '✨ **Советы:**\n' +
    '• Лица должны быть хорошо видны\n' +
    '• Используйте четкие портретные фото\n' +
    '• Избегайте групповых фотографий\n\n' +
    'Отправьте первое фото 👇\n\n' +
    '_(Используйте /cancel для отмены)_'
  );
}

export async function handlePhotoReceived(ctx: Context, bot: Telegraf) {
  if (!ctx.from || !ctx.message || !('photo' in ctx.message)) return;

  const userId = BigInt(ctx.from.id);
  const session = await getUserSession(userId);

  if (session.state !== 'WAITING_FOR_PHOTOS') {
    return; // Ignore photos if not waiting for them
  }

  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  
  try {
    // Download photo from Telegram
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);
    const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
    const photoBuffer = Buffer.from(response.data);

    // Upload to MinIO
    await ensureBucket();
    const fileName = `photos/${userId}/${Date.now()}_${photo.file_id}.jpg`;
    const photoUrl = await uploadFile(fileName, photoBuffer, 'image/jpeg');

    // Update session
    const currentData = session.data as { photoUrls: string[] } || { photoUrls: [] };
    const photoUrls = [...currentData.photoUrls, photoUrl];
    const photosReceived = session.photosReceived + 1;

    await updateUserSession(userId, {
      photosReceived,
      data: { photoUrls },
    });

    if (photosReceived === 1) {
      await ctx.reply('✅ Первое фото получено!\n\n📸 Отправьте второе фото 👇');
    } else if (photosReceived === 2) {
      await ctx.reply(
        '✅ Оба фото получены!\n\n' +
        '🎨 Начинаю создание романтического видео...\n' +
        '⏳ Это может занять 2-3 минуты. Пожалуйста, подождите.'
      );

      // Update session to processing
      await updateUserSession(userId, {
        state: 'PROCESSING',
      });

      // Start processing in background
      processGeneration(userId, photoUrls, session.currentGenerationId!, bot, ctx.from.id).catch(console.error);
    }
  } catch (error) {
    console.error('Error handling photo:', error);
    await ctx.reply(
      '❌ Ошибка при обработке фото. Попробуйте еще раз или используйте /cancel для сброса.'
    );
  }
}

async function processGeneration(
  userId: bigint, 
  photoUrls: string[], 
  generationId: string,
  bot: Telegraf,
  chatId: number
) {
  try {
    // Update status
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'UPLOADING_PHOTOS',
        photo1Url: photoUrls[0],
        photo2Url: photoUrls[1],
      },
    });

    // Send status update
    await bot.telegram.sendMessage(
      chatId, 
      '🎨 Шаг 1/3: Создаю романтическую сцену с двумя людьми...'
    );

    // Generate combined romantic image
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'GENERATING_IMAGE' },
    });

    const combinedImageBuffer = await createRomanticImage(photoUrls[0], photoUrls[1]);

    // Upload combined image to MinIO
    const combinedImageFileName = `combined/${userId}/${Date.now()}_romantic.jpg`;
    const combinedImageUrl = await uploadFile(
      combinedImageFileName, 
      combinedImageBuffer, 
      'image/jpeg'
    );

    await prisma.generation.update({
      where: { id: generationId },
      data: { combinedImageUrl },
    });

    await bot.telegram.sendMessage(
      chatId, 
      '✅ Романтическое фото создано!\n\n🎬 Шаг 2/3: Генерирую видео...'
    );

    // Generate video
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'GENERATING_VIDEO' },
    });

    const videoUrl = await generateVideoFromImage(combinedImageUrl);

    // Download and upload video to MinIO
    await bot.telegram.sendMessage(chatId, '📥 Скачиваю видео...');
    
    const videoBuffer = await downloadVideo(videoUrl);
    const videoFileName = `videos/${userId}/${Date.now()}_romantic.mp4`;
    const finalVideoUrl = await uploadFile(videoFileName, videoBuffer, 'video/mp4');

    // Update generation as completed
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'COMPLETED',
        videoUrl: finalVideoUrl,
        completedAt: new Date(),
      },
    });

    // Decrement user generations
    await decrementUserGenerations(userId);

    // Reset session
    await updateUserSession(userId, {
      state: 'IDLE',
      currentGenerationId: null,
      photosReceived: 0,
      data: null,
    });

    // Send video to user
    await bot.telegram.sendMessage(
      chatId,
      '✅ **Готово!** Ваше романтическое видео готово! 🎉\n\nОтправляю...'
    );

    await bot.telegram.sendVideo(chatId, Input.fromBuffer(videoBuffer), {
      caption: '❤️ Вот ваше романтическое видео!\n\n' +
        '💡 Понравилось? Создайте еще!\n' +
        'Используйте /generate или /balance для проверки генераций.',
    });

  } catch (error) {
    console.error('Error processing generation:', error);

    // Update generation as failed
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Reset session
    await updateUserSession(userId, {
      state: 'IDLE',
      currentGenerationId: null,
      photosReceived: 0,
      data: null,
    });

    await bot.telegram.sendMessage(
      chatId,
      '❌ **Ошибка при создании видео**\n\n' +
      'Произошла ошибка. Ваша генерация не была учтена.\n\n' +
      'Попробуйте снова с /generate'
    );
  }
}

export async function handleCancel(ctx: Context) {
  if (!ctx.from) return;

  const userId = BigInt(ctx.from.id);
  const session = await getUserSession(userId);

  if (session.state === 'IDLE') {
    await ctx.reply('ℹ️ У вас нет активных операций для отмены.');
    return;
  }

  if (session.state === 'PROCESSING') {
    await ctx.reply(
      '⚠️ Генерация уже началась и не может быть отменена.\n' +
      'Пожалуйста, дождитесь завершения.'
    );
    return;
  }

  // Cancel current generation
  if (session.currentGenerationId) {
    await prisma.generation.update({
      where: { id: session.currentGenerationId },
      data: {
        status: 'FAILED',
        errorMessage: 'Cancelled by user',
      },
    });
  }

  // Reset session
  await updateUserSession(userId, {
    state: 'IDLE',
    currentGenerationId: null,
    photosReceived: 0,
    data: null,
  });

  await ctx.reply('✅ Операция отменена. Используйте /generate для начала новой генерации.');
}

