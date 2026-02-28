import { TextStyle } from 'react-native';

// Font stack: Use System font with extreme weight variation
// This achieves the Uber aesthetic: weight contrast does the heavy lifting

export const Typography = {
  // Display — massive, commanding
  display: {
    fontSize: 42,
    fontWeight: '900' as TextStyle['fontWeight'],
    letterSpacing: -2,
    lineHeight: 46,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: 34,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1.2,
    lineHeight: 38,
  } as TextStyle,
  h2: {
    fontSize: 26,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.8,
    lineHeight: 30,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    lineHeight: 24,
  } as TextStyle,
  h4: {
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 22,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 26,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.1,
    lineHeight: 22,
  } as TextStyle,
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 18,
  } as TextStyle,

  // Labels — tight, uppercase for category tags
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.4,
    lineHeight: 18,
  } as TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.6,
    lineHeight: 16,
  } as TextStyle,
  labelCaps: {
    fontSize: 11,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 1.2,
    lineHeight: 14,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,

  // Monospaced numeric — timer, scores, metrics
  monoDisplay: {
    fontSize: 64,
    fontWeight: '200' as TextStyle['fontWeight'],
    letterSpacing: -3,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    lineHeight: 68,
  } as TextStyle,
  monoLarge: {
    fontSize: 36,
    fontWeight: '300' as TextStyle['fontWeight'],
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    lineHeight: 40,
  } as TextStyle,
  mono: {
    fontSize: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    lineHeight: 22,
  } as TextStyle,

  // Button
  buttonLarge: {
    fontSize: 17,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 22,
  } as TextStyle,
  button: {
    fontSize: 15,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 20,
  } as TextStyle,
};
