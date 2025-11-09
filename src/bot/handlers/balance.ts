import { Context } from 'telegraf';
import { prisma } from '../../services/database.js';

export async function handleBalance(ctx: Context) {
  if (!ctx.from) return;

  const userId = BigInt(ctx.from.id);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    await ctx.reply('❌ Пользователь не найден. Используйте /start для регистрации.');
    return;
  }

  const totalGenerations = user.freeGenerations + user.paidGenerations;

  const message = `
💎 **Ваш баланс генераций:**

🎁 Бесплатные: ${user.freeGenerations}
💰 Оплаченные: ${user.paidGenerations}
📊 Всего доступно: ${totalGenerations}

${totalGenerations === 0 ? '❗️ У вас закончились генерации. Используйте /buy для покупки!' : '✅ Вы можете создавать видео!'}
`;

  await ctx.reply(message);
}

