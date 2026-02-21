# Bulgarian Warhammer Team Website

A competitive Warhammer 40k team management website built with Next.js and Supabase.

## Features

- **Landing Page**: Discord/YouTube links, recent news
- **News Section**: Admins can create posts with web editor, including weekly meta reports
- **Player Profiles**: View all players and their statistics
- **Statistics**: Win rates, average points, match history (team members only)
- **Team Documents**: Link to Google Docs for team matrices (team members only)
- **Match Tracking**: Record matches with army lists, opponents, scores, results
- **Role-based Access**: Admin, Team Member, Tryout roles

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Hosting**: Vercel

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to **SQL Editor** in the Supabase dashboard
4. Copy the contents of `supabase_schema.sql` and run it

### 2. Configure Environment Variables

1. Go to Supabase dashboard → **Project Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Update `.env.local` with your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

### 3. Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### 5. Create Admin User

1. Go to your deployed site and sign up with your email
2. In Supabase, go to **Authentication** → **Users**
3. Find your user and note the ID
4. Go to **SQL Editor** and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'your_user_id';
   ```

## User Roles

- **Admin**: Full access - manage players, matches, news, documents, user roles
- **Team Member**: View players, statistics, documents
- **Tryout**: View players only

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── login/             # Login/signup
│   ├── news/             # News with editor
│   ├── players/          # Player profiles & stats
│   ├── documents/        # Team documents
│   └── admin/            # Admin panel
├── components/           # UI components
├── contexts/             # React contexts (Auth)
├── lib/                  # Supabase client
└── types/                # TypeScript types
```

## License

MIT
