import { Context } from 'telegraf';
import { prisma } from '../../services/database.js';
import { env } from '../../config/env.js';

export async function handleBuy(ctx: Context) {
  if (!ctx.from) return;

  const message = `
💎 **Купить генерации**

Выберите пакет:

1️⃣ **5 генераций** - ${env.STARS_PRICE} ⭐️
2️⃣ **10 генераций** - ${env.STARS_PRICE * 2} ⭐️
3️⃣ **25 генераций** - ${env.STARS_PRICE * 4} ⭐️ (выгодно!)

После оплаты генерации будут сразу добавлены на ваш счет.

Выберите пакет, нажав на кнопку ниже:
`;

  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          { 
            text: `5 генераций - ${env.STARS_PRICE} ⭐️`, 
            callback_data: 'buy_5' 
          }
        ],
        [
          { 
            text: `10 генераций - ${env.STARS_PRICE * 2} ⭐️`, 
            callback_data: 'buy_10' 
          }
        ],
        [
          { 
            text: `25 генераций - ${env.STARS_PRICE * 4} ⭐️ 🔥`, 
            callback_data: 'buy_25' 
          }
        ],
      ],
    },
  });
}

export async function handleBuyCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const data = ctx.callbackQuery.data;
  const userId = BigInt(ctx.from.id);

  let generations = 0;
  let amount = 0;

  switch (data) {
    case 'buy_5':
      generations = 5;
      amount = env.STARS_PRICE;
      break;
    case 'buy_10':
      generations = 10;
      amount = env.STARS_PRICE * 2;
      break;
    case 'buy_25':
      generations = 25;
      amount = env.STARS_PRICE * 4;
      break;
    default:
      await ctx.answerCbQuery('❌ Неверный пакет');
      return;
  }

  try {
    // Send invoice for Telegram Stars payment
    await ctx.replyWithInvoice({
      title: `${generations} генераций видео`,
      description: `Покупка ${generations} генераций для создания романтических видео`,
      payload: JSON.stringify({ userId: userId.toString(), generations }),
      provider_token: '', // Empty for Telegram Stars
      currency: 'XTR', // Telegram Stars currency
      prices: [
        {
          label: `${generations} генераций`,
          amount: amount,
        },
      ],
    });

    await ctx.answerCbQuery('✅ Счет отправлен!');
  } catch (error) {
    console.error('Error sending invoice:', error);
    await ctx.answerCbQuery('❌ Ошибка при создании счета');
  }
}

export async function handlePreCheckoutQuery(ctx: Context) {
  if (!ctx.preCheckoutQuery) return;

  try {
    // Always approve pre-checkout query
    await ctx.answerPreCheckoutQuery(true);
  } catch (error) {
    console.error('Error answering pre-checkout query:', error);
    await ctx.answerPreCheckoutQuery(false, 'Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleSuccessfulPayment(ctx: Context) {
  if (!ctx.message || !('successful_payment' in ctx.message) || !ctx.from) return;

  const payment = ctx.message.successful_payment;
  const userId = BigInt(ctx.from.id);

  try {
    const payload = JSON.parse(payment.invoice_payload);
    const generations = payload.generations;

    // Create payment record
    await prisma.payment.create({
      data: {
        userId,
        amount: payment.total_amount,
        generationsAdded: generations,
        telegramPaymentId: payment.telegram_payment_charge_id,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Add generations to user
    await prisma.user.update({
      where: { id: userId },
      data: {
        paidGenerations: {
          increment: generations,
        },
      },
    });

    await ctx.reply(
      `✅ **Оплата успешна!**\n\n` +
      `💎 Добавлено генераций: ${generations}\n` +
      `🎬 Теперь вы можете создавать еще больше видео!\n\n` +
      `Используйте /generate для создания видео или /balance для проверки баланса.`
    );
  } catch (error) {
    console.error('Error processing successful payment:', error);
    await ctx.reply('❌ Ошибка при обработке платежа. Обратитесь в поддержку.');
  }
}

