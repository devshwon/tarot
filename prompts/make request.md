You are a senior frontend engineer building a production-ready web app.

Build a Toss Apps in WebView compatible mini app using:

- React

- Vite

- TypeScript

- Functional components

- Clean folder structure

App Name:

AI 운세·타로 “오늘의 한 장”

Primary Goal:

A daily fortune/tarot micro-content app optimized for short sessions and rewarded ad monetization.

Constraints:

- Non-game category

- Must follow Toss Apps WebView environment constraints

- Keep UI minimal and mobile-first

- Design should be clean, card-based, soft gradient background

- Fast first paint (under 1s perception)

- No external heavy UI libraries

Core Concept:

User opens the app → instantly sees "Today's Card" → short interpretation (free) → detailed interpretation unlocked via rewarded ad.

Important:

- This is entertainment only. Include a visible disclaimer.

- Do NOT generate financial advice.

- Avoid investment, gambling, health diagnosis language.

- Avoid deterministic claims like "this will definitely happen".

- Tone should be suggestive, light, reflective.

Screens Required:

1. Home (Today’s Card)

2. Detailed Interpretation (Reward unlock)

3. Ask a Question (User input)

4. History (last 14 days)

5. Settings / Disclaimer

Core Features:

- Daily card selection based on date hash (no login required)

- LocalStorage-based history

- Reward unlock state

- Simple animation on card reveal

- Share result (text-based)

State Management:

Use React hooks only (no Redux).

Folder Structure:

src/

  components/

  pages/

  hooks/

  utils/

  types/

Provide:

- Full working code

- Example tarot card dataset (at least 10 cards)

- Utility for deterministic daily card generation

- Clean mobile UI

- Commented code