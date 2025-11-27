/**
 * Calendar Constants
 */

import type { TEventColor } from './types';

export const COLORS: TEventColor[] = [
  "blue",
  "green", 
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "teal"
];

// Hour height in pixels for day/week views
export const HOUR_HEIGHT = 96;
export const HALF_HOUR_HEIGHT = 48;

// Time format constants
export const TIME_FORMAT_24H = "HH:mm";
export const TIME_FORMAT_12H = "hh:mm a";