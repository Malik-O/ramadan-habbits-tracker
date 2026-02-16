Cursor AI Prompt: Gamified Ramadan Habit Tracker (Next.js)

Role: Expert Full-stack Developer & UI/UX Designer.
Goal: Build a mobile-first, responsive web application using Next.js that replaces a traditional paper Ramadan habit tracker with a modern, gamified experience.

1. Technical Stack

Framework: Next.js 14+ (App Router).

Styling: Tailwind CSS.

Components: Shadcn/UI (for clean, accessible components).

Icons: Lucide-React.

Animations: Framer Motion (for smooth mobile transitions) & canvas-confetti.

State: LocalStorage for persistence (MVP focus).

2. Core Habit Data (Extracted from User Table)

The application must organize habits into the following specific blocks:

Fajr: Adhan Dhikr, Dua, Sunnah (2 Rakat), Prayer (Jama'ah/On time), Post-prayer Dhikr, Morning Azkar, Quran Reading, Duha Prayer.

Dhuhr: Adhan Dhikr, Dua, Sunnah (Before/After), Prayer, Post-prayer Dhikr, Quran Reading.

Asr: Adhan Dhikr, Dua, Prayer, Post-prayer Dhikr, Evening Azkar, Quran Reading.

Maghrib: Pre-Iftar Dua, Adhan Dhikr, Dua, Prayer, Post-prayer Dhikr, Sunnah (After).

Isha: Adhan Dhikr, Dua, Prayer, Post-prayer Dhikr, Sunnah (After), Taraweeh, Quran Reading.

Sahar (Late Night): Tahajjud, Witr, Suhoor Istighfar.

General: Tadabbur/Reflective Reading, Salawat on the Prophet ﷺ.

3. UI/UX Requirements (Mobile-First)

Visual Style: Premium "Native App" look. Dark mode by default.

Colors: - Background: Deep Navy/Slate (#020617).

Primary: Amber/Gold (#f59e0b) for spiritual highlights.

Success: Emerald (#10b981).

Layout:

Header: Sticky header with a "Daily Progress Ring" and "Current XP".

Dynamic View: Automatically expand the current prayer block based on the user's local time.

Habit Row: A clean row with the habit name on the left and a "Checkbox" or "Pill Toggle" on the right.

Animations: Use framer-motion for list entry animations and scale-down effects on tap.

4. MVP Gamification Features

XP System: +10 XP for every habit checked.

Daily Streak: A fire icon showing consecutive days of activity.

Confetti: Trigger a full-screen confetti burst when a specific time-block (e.g., all Fajr habits) is 100% completed.

Completion Sound: (Optional) Include a subtle "tick" sound when checking items.

5. Implementation Instructions for Cursor

Scaffold the Data Structure: Create a constants/habits.ts file to store the habit definitions.

Persistence Layer: Use a custom useLocalStorage hook to ensure data isn't lost on refresh.

Responsive Container: Wrap the app in a container that stays max-w-md on desktop and centered, but full width on mobile.

Interactive Logic: - Ensure the "Progress Ring" updates in real-time.

Implement a "Reset at Midnight" logic or a "Day Selector" (for 30 days of Ramadan).

Prompt to Cursor: "Please generate the code for this app. Focus on making it look like a high-end mobile app (like Linear or a modern banking app). The interface should be intuitive with large touch targets. Use Shadcn for the progress bar and cards."