# Pamatováček 🐝 - Your Bee-utiful Task Manager

A gamified todo list application with **Spaced Repetition** learning system and social features. Track tasks, earn honey coins, and compete with friends!

## 🌟 Features

### 📚 Learning Tasks (Spaced Repetition)
- Create tasks you want to remember (e.g., "Bones in the body", "French vocabulary")
- Tasks appear based on **customizable forgetting curve** (default: 1, 3, 7, 14, 30 days)
- Track repetition count (1x, 2x, 3x...)
- Tasks never get deleted - they stay in the cycle permanently
- Displayed in **accent green color** for easy identification

### 🛒 Shop Tasks (Punishments/Rewards)
- Create custom tasks for your "shop" (e.g., "Come to school in funny costume", "Eat spicy sauce")
- Group members can **buy tasks** using their coins and assign them to you
- Bought tasks appear in todo list with **purple secondary color** (distinguishable from learning tasks)
- Same spaced-repetition system as learning tasks
- Custom task option available (higher price)

### 💰 Coin System
- **Earn coins** by completing tasks ✅
- **Lose coins** if you don't complete tasks by deadline (default 4 AM)
- When you fail, coins go to **other group members** as punishment
- Each group has separate coin balances
- Buy fun tasks from the shop with your coins

### 👥 Group Features
- Create groups (study groups, friend circles, couples, etc.)
- All group members share **Learning Tasks**
- Each member has their **own coins**
- Shop tasks are visible to all, but only assigned to specific members
- Invite members by email

### 🎨 Design
- **Cute bee theme** with honey aesthetics 🍯
- **Theme toggle** (Light/Dark/System)
- **Cool confetti animation** when completing tasks!
- Color-coded tasks (Learning vs Shop)
- Responsive design for mobile and desktop

### ⚙️ User Settings
- Customize **Spaced Repetition intervals** (default: [1, 3, 7, 14, 30] days)
- Adjust **deadline time** for task completion (default: 4 AM)
- Theme preferences saved per user

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Database**: [Turso](https://turso.tech) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **API**: [tRPC](https://trpc.io)
- **Auth**: [Better Auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Type Safety**: TypeScript
- **Runtime**: Bun

## 📦 Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
bun run db:push

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Database Schema

### Users
- User preferences (theme, intervals, deadline hour)
- Better Auth integration

### Groups
- Group management
- Member tracking with individual coin balances

### Tasks
- Task type: `learning`, `shop`, or `custom`
- Configurable intervals for spaced repetition
- Cost and reward coins

### User Tasks
- Individual task instances per user
- Track repetition count and next show date
- Status tracking (pending/completed/failed)

## 🎮 How to Use

1. **Sign up** and create an account
2. **Create a group** or join an existing one
3. **Add Learning Tasks** - topics you want to remember
4. **Add Shop Tasks** - fun challenges others can buy
5. **Complete tasks daily** to earn coins 🍯
6. **Buy tasks** from the shop to assign to friends
7. **Don't miss deadlines** or coins go to others!

## 🎨 Color System

See [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) for detailed color usage.

- **Primary** (Honey Yellow) - Main actions, coins
- **Secondary** (Lavender Purple) - Shop tasks, bought tasks
- **Accent** (Sage Green) - Learning tasks
- **Muted** (Peach Orange) - Backgrounds
- **Destructive** (Soft Red) - Errors

## 📝 Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run typecheck    # Check TypeScript
bun run check        # Run Biome linter
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio
```

## 🐝 Key Pages

- `/` - Landing page (redirects to dashboard if logged in)
- `/auth/sign-in` - Login page (centered, beautiful design)
- `/auth/sign-up` - Registration page
- `/dashboard` - Your groups overview
- `/group/[id]` - Group page with tasks and shop
- `/settings` - User settings (coming soon)

## 🤝 Contributing

This is a personal project but feedback is welcome!

## 📄 License

MIT
