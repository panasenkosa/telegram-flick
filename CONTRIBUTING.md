# Contributing to Telegram Flick Bot

Thank you for your interest in contributing! 🎉

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/telegram-flick.git
cd telegram-flick
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up environment (see SETUP.md)

5. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

1. Make your changes
2. Test thoroughly:
   - Test bot commands
   - Test photo upload
   - Test video generation
   - Test payment flow

3. Ensure code quality:
```bash
# Check TypeScript
pnpm build

# Format code (if prettier is configured)
pnpm format
```

4. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push to your fork:
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request

## Code Style

- Use TypeScript with strict mode
- Follow existing code structure
- Add comments for complex logic
- Use meaningful variable names
- Handle errors gracefully
- Log important operations

## Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

## Testing

Before submitting PR:
1. Test all bot commands
2. Test photo upload and processing
3. Test video generation
4. Test payment flow (if applicable)
5. Check for TypeScript errors
6. Verify no console errors

## Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🧪 Tests
- 🌐 Internationalization

## Questions?

Feel free to open an issue for any questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

