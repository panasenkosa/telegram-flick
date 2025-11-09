# Frequently Asked Questions (FAQ)

## General Questions

### What is Telegram Flick Bot?

Telegram Flick Bot is an AI-powered bot that creates romantic videos from two photos. It combines photos into a romantic scene and generates an animated video.

### How does it work?

1. You send 2 photos to the bot
2. GPT-Image combines them into a romantic scene
3. Replicate's Wan-Video creates an animated video
4. You receive the final video

### Is it free?

Each user gets 1 free generation. Additional generations can be purchased with Telegram Stars.

### How long does it take?

Video generation typically takes 2-3 minutes, depending on API load.

## Technical Questions

### What technologies are used?

- **Backend:** TypeScript, Node.js
- **Bot Framework:** Telegraf
- **Database:** PostgreSQL with Prisma ORM
- **File Storage:** MinIO (S3-compatible)
- **AI APIs:** OpenAI GPT-Image, Replicate Wan-Video
- **Payment:** Telegram Stars

### Can I self-host it?

Yes! The bot is open source and can be self-hosted. See [SETUP.md](../SETUP.md) for instructions.

### What are the system requirements?

**Minimum:**
- Node.js 20+
- PostgreSQL 14+
- MinIO or S3-compatible storage
- 2GB RAM
- 10GB disk space

**Recommended:**
- 4GB RAM
- 20GB disk space
- SSD storage

### Does it support multiple languages?

Currently, the bot is in Russian. Multi-language support is planned for future releases.

## Usage Questions

### What kind of photos should I use?

**Best results:**
- Clear, well-lit photos
- Faces clearly visible
- Portrait or headshot style
- Single person per photo
- High resolution

**Avoid:**
- Group photos
- Blurry images
- Low light photos
- Sunglasses or face coverings
- Very small faces

### Can I use the same photo twice?

Yes, but the result will show the same person twice in the romantic scene.

### What if the generation fails?

If generation fails, your credit is not deducted. You can try again with different photos.

### How do I cancel a generation?

Use the `/cancel` command to cancel an active generation before processing starts.

### Can I download the video?

Yes, the video is sent directly to you in Telegram and can be downloaded.

## Payment Questions

### How does payment work?

The bot uses Telegram Stars for payments, which is Telegram's native payment system.

### What payment methods are accepted?

Any payment method supported by Telegram Stars in your region.

### How much does it cost?

Pricing (customizable in configuration):
- 5 generations: 100 Stars
- 10 generations: 200 Stars
- 25 generations: 400 Stars

### Can I get a refund?

Refunds are handled through Telegram's payment system. Contact support if you have issues.

### Do purchased generations expire?

No, purchased generations never expire.

## Privacy and Security

### What data do you store?

We store:
- Telegram user ID and username
- Generation history
- Payment records
- Uploaded photos and generated videos

### How long do you keep my photos?

Photos and videos are stored for 7 days, after which they are automatically deleted.

### Is my data secure?

Yes. All data is stored securely:
- Database is encrypted
- Files stored in private buckets
- Presigned URLs with expiration
- No third-party sharing

### Can I delete my data?

Contact support to request data deletion.

### Do you use my photos for training?

No, your photos are never used for AI training or any other purpose besides generating your video.

## Troubleshooting

### Bot is not responding

1. Check if bot is online
2. Try `/start` command
3. Wait a few minutes and retry
4. Contact support if issue persists

### Photo upload failed

1. Ensure photo is < 10MB
2. Try a different photo
3. Check your internet connection
4. Use `/cancel` and try again

### Video generation stuck

1. Wait up to 5 minutes
2. Check `/balance` to see if generation was counted
3. Try again with `/generate`
4. Contact support if stuck repeatedly

### Payment not processed

1. Check if payment went through in Telegram
2. Use `/balance` to verify
3. Contact support with payment ID

### Poor quality results

Try:
- Using higher quality photos
- Better lit photos
- Clearer facial features
- Different photo angles

## API and Development

### Can I contribute to the project?

Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Is there an API available?

Currently, the bot only works through Telegram. REST API is planned for future releases.

### Can I modify the prompts?

Yes, if self-hosting. Edit the prompts in `src/services/openai.ts` and `src/services/replicate.ts`.

### How can I add new features?

1. Fork the repository
2. Create a feature branch
3. Implement your feature
4. Submit a pull request

### What about rate limits?

The bot respects OpenAI and Replicate rate limits. Queue system is planned for high volume.

## Deployment

### Where can I deploy this?

- Any VPS (DigitalOcean, Linode, etc.)
- Cloud platforms (Heroku, Railway, etc.)
- Kubernetes clusters
- Local servers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

### What's the estimated cost?

Depends on usage. For 100 users/day:
- Hosting: $10-20/month
- OpenAI: $20-50/month
- Replicate: $30-100/month
- **Total: ~$60-170/month**

### Do I need a domain?

No, but recommended for webhook mode (future feature).

### Can I use it without Docker?

Yes! See [SETUP.md](../SETUP.md) for non-Docker setup.

## Feature Requests

### Can you add feature X?

Please open an issue on GitHub with your feature request!

### Planned features

- [ ] Multiple video styles
- [ ] Custom prompts
- [ ] Batch processing
- [ ] Video previews
- [ ] Multi-language support
- [ ] Subscription plans
- [ ] Referral system

### How can I request a feature?

Open an issue on GitHub or contact support.

## Support

### How do I get help?

1. Check this FAQ
2. Read documentation
3. Check GitHub issues
4. Open a new issue
5. Contact support

### Where can I report bugs?

Open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Logs (if applicable)

### Is there a community?

Join our Telegram group: [Link to be added]

### How can I contact support?

- GitHub Issues: [repository link]
- Telegram: [support bot/group]
- Email: [support email]

## Legal

### What's the license?

MIT License. See [LICENSE](../LICENSE) for details.

### Can I use it commercially?

Yes, the MIT license allows commercial use.

### Are there any restrictions?

- Respect OpenAI and Replicate terms of service
- Respect Telegram terms of service
- Don't use for illegal purposes
- Don't abuse the system

### Who owns the generated content?

You own the generated videos. The bot just provides the service.

## Miscellaneous

### Why "Flick"?

Because it creates quick video "flicks" from your photos!

### Can I customize the romantic scene?

Custom prompts are planned for future releases.

### Does it work with pets?

It's designed for people, but you can try with pets!

### What's the maximum photo size?

10MB per photo (Telegram limit).

### Can I use old photos?

Yes, any photo works as long as faces are visible.

### How accurate is face recognition?

The AI preserves facial features quite well, but results may vary based on photo quality.

---

**Didn't find your answer?** Open an issue on GitHub or contact support!

