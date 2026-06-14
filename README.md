# AI Brand Positioning Helper

Single-page Next.js app for turning a short product description into a clearer positioning draft, selling points, user persona, differentiation angles, and Xiaohongshu content directions.

## Stack

- Next.js
- Tailwind CSS v4
- OpenAI API
- TypeScript

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add your API key to `.env.local`:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-5.5
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Output

The app generates:

- Brand positioning
- Core selling points
- User persona
- Differentiation advantages
- Xiaohongshu content directions
