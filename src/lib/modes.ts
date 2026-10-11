import type { Mode, Verdict } from '../types';

export interface ModeInfo {
  title: string;
  question: string;
  /** Rotating headline shown above each card on the play screen. */
  prompts: string[];
  blurb: string;
  emoji: string;
  accent: string;
  labels: Record<Verdict, string>;
  hasSuper: boolean;
}

// Single source for playable modes: drives the nav, the welcome grid and the play screen.
export const MODES: Record<Mode, ModeInfo> = {
  smash: {
    title: 'Smash or Pass',
    question: 'Would you?',
    prompts: [
      'Would you?',
      'Be honest. Nobody’s watching.',
      'Swipe responsibly.',
      'Is it a 10 or a mulligan?',
      'Untapped and available.',
      'Would you share a sleeve?',
      'Hot singles in your graveyard.',
      'Would you take this one home?',
      'One-night stand or 99-card commitment?',
      'Would you block for it?',
      'Feeling a little summoning sick?',
      'Is this your type? Check the type line.',
      'Main phase or main character?',
      'Swipe now, sideboard later.',
      'Would you bring this one to game night?',
      'Worth the mana?',
      'Would you let it target you?',
      'Commander material?',
      'Does this one have protection from you?',
      'Do you feel the haste?',
    ],
    blurb: 'The meme classic. Swipe on art from across the Multiverse and own your choices.',
    emoji: '💘',
    accent: '#ff6fb5',
    labels: { yes: 'SMASH', no: 'PASS', super: 'SUPER SMASH', skip: 'SKIP' },
    hasSuper: true,
  },
  good: {
    title: 'Good or Not',
    question: 'Is this a good card?',
    prompts: [
      'Is this a good card?',
      'Bomb or bulk?',
      'First pick or last pick?',
      'Would you put it in your 99?',
      'Constructed playable or draft chaff?',
      'Does it see play?',
      'Banlist material?',
      'Would you trade for this?',
      'Is the mana cost justified?',
      'Staple or sleeper?',
      'Would you run it in your cube?',
      'Rate it. No looking it up.',
      'Would a pro play this?',
      'Worth the cardboard it’s printed on?',
      'Card advantage or card disadvantage?',
      'Would you crack a pack hoping for this?',
      'Format staple or binder filler?',
      'Gut check: playable?',
    ],
    blurb: 'Put your card evaluation where your mouth is. Gut call only, no looking it up.',
    emoji: '🧠',
    accent: '#3ecf7a',
    labels: { yes: 'GOOD', no: 'BAD', super: 'GREAT', skip: 'SKIP' },
    hasSuper: false,
  },
};

export const MODE_ORDER: Mode[] = ['smash', 'good'];

/** Placeholders on the welcome page so the layout already has room for future modes. */
export const COMING_SOON: { title: string; blurb: string; emoji: string }[] = [
  { title: 'Card Bracket', blurb: 'Head-to-head knockout rounds until one card is crowned.', emoji: '🏆' },
  { title: 'Daily Date', blurb: 'One card a day. Everyone votes. See how the world swiped.', emoji: '📅' },
];
