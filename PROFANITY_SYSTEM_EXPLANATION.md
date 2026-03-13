# Profanity Filter System Explanation

This document provides a detailed explanation of how the profanity and content moderation system works within the Community Chat section of the Farmhive application.

## Overview

The chat system employs a robust, multi-lingual profanity filter designed to keep the community safe from toxic, harmful, spammy, or inappropriate content. The core logic for this moderation resides in `src/lib/profanityFilter.ts`.

The system is built on top of the `bad-words` library (a standard English profanity filter) and is heavily extended with a large custom dictionary to handle specific contexts, slangs, and regional languages (Hindi and Hinglish).

## How It Works Under The Hood

### 1. The Base Filter
The system initializes a base filter using the `bad-words` package. By default, this package intelligently detects and flags standard English swear words, racial slurs, and highly inappropriate language. 

### 2. The Custom Dictionary Extension
To make the filter effective for a diverse user base (especially the farming community in India), the default English filter is injected with a massive list of **Custom Banned Words**. This custom array is divided into several strict categories:

*   **Scams, Fraud, Spam & Bots:** Blocks words related to phishing, fake lotteries, OTP sharing, pyramid schemes, fake customer care, "click here" spam, etc. (e.g., *scam, fraud, otp share na karein, paisa double, dhokhadhadi*).
*   **Murder, Violence & Harmful Actions:** Blocks death threats, violent speech, and talk of illegal activities (e.g., *murder, kill, jaan se maar dunga, maar peet*).
*   **Suicide & Self-Harm:** Flags terms related to self-harm to prevent triggering content and keep users safe (e.g., *suicide, kill yourself, aatmahatya, zeher*).
*   **Adult, Sexual & Explicit Content:** Blocks all forms of NSFW content, sexual slang, and pornography references (e.g., *porn, explicit content, gandi video, asleel*).
*   **English Slangs & Toxicity:** Extra English derogatory terms, insults, and toxic behavioral words not covered by the base filter.
*   **Hinglish Slangs & Toxicity:** Blocks swear words written playfully or intentionally misspelled using English alphabets for Hindi words (e.g., *gali, bakwas, bewakoof, nalla, chapri*, and much worse profanities).
*   **Hindi (Devanagari) Slangs & Toxicity:** Blocks the most common abusive and toxic words directly written in the Hindi script (e.g., *चूतिया, गांडू, साला, हरामखोर, मूर्ख*).

### 3. Core Functions Available in the System

The `src/lib/profanityFilter.ts` module exports two main functions to handle incoming messages:

#### A. `checkProfanity(message: string)`
This is the primary function used to aggressively **block** bad messages. 
- It takes the user's chat message as input.
- It runs the message against both the base English list and the massive custom English/Hindi/Hinglish list.
- **Returns:** An object containing `isProfane: boolean` and a `reason: string`.
  - If a bad word is detected, it returns `{ isProfane: true, reason: 'Message contains inappropriate or abusive language.' }`.
- **Usage:** In the chat component, before a message is sent to the database, you pass it through this function. If `isProfane` is true, you can show a popup blocking the user from sending the message.

#### B. `cleanMessage(message: string)`
This function is a softer alternative to outright blocking.
- Instead of returning an error, it takes the user's message and replaces the detected bad words with asterisks (`***`).
- **Usage:** If you allow users to send the message but want to protect the community from reading the bad words, you pass it through `cleanMessage` and save the "asterisked" version to the database instead.

## How Can Administrators Add More Words?

If new toxic trends, slangs, or spam methods arise, administrators or developers can easily update the system.

1. Open `src/lib/profanityFilter.ts`.
2. Locate the `customBannedWords` array.
3. Simply type the new word into the array under the appropriate category.
   *Example: To block a new scam called "FarmCrypto", just add `"farmcrypto"` to the Scams array.*
4. The system is case-insensitive, meaning blocking "scam" will also automatically block "SCAM", "Scam", and "sCam".

## Error Handling
The filter is wrapped in `try-catch` blocks. If the filter ever crashes or fails unexpectedly, the system defaults to allowing the message (`isProfane: false`). This ensures that the chat system never completely breaks or prevents users from chatting just because the moderation tool experienced a minor glitch.
