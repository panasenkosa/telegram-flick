const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const bot = new Telegraf("8288937146:AAF9znNPmTwl-sCniwyfC0yN-e8eSm_sb-w");

bot.start(ctx => ctx.reply('Welcome to my bot.'));
bot.help(ctx => ctx.reply('For help, contact <email>'));
bot.on(message('text'), ctx => ctx.reply('Your message received 👍'));
bot.launch();
