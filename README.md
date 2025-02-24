<a href="https://www.llamacoder.io">
  <img alt="Llama Coder" src="./public/og-image.png">
  <h1 align="center">Llama Coder</h1>
</a>

<p align="center">
  An open source Claude Artifacts – generate small apps with one prompt. Powered by Llama 3 on Together.ai.
</p>

## Tech stack

- [Llama 3.1 405B](https://ai.meta.com/blog/meta-llama-3-1/) from Meta for the LLM
- [Together AI](https://togetherai.link/?utm_source=example-app&utm_medium=llamacoder&utm_campaign=llamacoder-app-signup) for LLM inference
- [Sandpack](https://sandpack.codesandbox.io/) for the code sandbox
- Next.js app router with Tailwind
- Helicone for observability
- Plausible for website analytics

## Cloning & running

1. Clone the repo: `git clone https://github.com/Nutlope/llamacoder`
2. Set up your environment variables:
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Add your [Together AI API key](https://togetherai.link/?utm_source=example-app&utm_medium=llamacoder&utm_campaign=llamacoder-app-signup): `TOGETHER_API_KEY=`
   - Configure your database URL in `.env`. Example for local PostgreSQL:
     ```
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llamacoder"
     ```

3. Set up the database:
   - Install PostgreSQL if not already installed
   - Create a new database: `createdb llamacoder`
   - Run database migrations: `npx prisma migrate dev`

4. Install dependencies and start the app:
   - Run `npm install` to install dependencies
   - Run `npm run dev` to start the development server

## Database Setup

The application uses PostgreSQL as its database. Here's how to set it up:

1. Install PostgreSQL if you haven't already:
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. Create a new database:
   ```bash
   createdb llamacoder
   ```

3. Configure your database connection:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` in `.env` with your database credentials
   - The URL format is: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Troubleshooting

- **Database Connection Issues**:
  - Ensure PostgreSQL is running
  - Verify your database credentials in `.env`
  - Check if the database exists: `psql -l`
  - Make sure you can connect: `psql -d llamacoder`

## Contributing

For contributing to the repo, please see the [contributing guide](./CONTRIBUTING.md)
