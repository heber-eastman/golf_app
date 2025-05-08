# Golf App Monorepo

[![CI](https://github.com/heber-eastman/golf_app/actions/workflows/ci.yml/badge.svg)](https://github.com/heber-eastman/golf_app/actions/workflows/ci.yml)

A monorepo for the Golf App and its related packages.

## Structure

- `apps/*` - Application packages
- `packages/*` - Shared packages and libraries

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## CI/CD

The project uses GitHub Actions for continuous integration. The CI pipeline:
- Runs on Node.js version specified in `.nvmrc`
- Installs dependencies with `npm ci`
- Runs linting and tests
- Uploads test coverage as an artifact

Pre-commit hooks are set up using Husky to ensure code quality:
- Runs linting
- Runs tests 