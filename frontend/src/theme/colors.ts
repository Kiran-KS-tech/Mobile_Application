export const Colors = {
  light: {
    // Backgrounds
    background:        '#FFFFFF',
    surface:           '#F7F7F7',
    surfaceElevated:   '#EFEFEF',
    surfaceOverlay:    'rgba(0,0,0,0.04)',

    // Borders
    border:            '#E8E8E8',
    borderStrong:      '#1A1A1A',
    divider:           '#F0F0F0',

    // Text
    textPrimary:       '#0A0A0A',
    textSecondary:     '#4A4A4A',
    textTertiary:      '#9A9A9A',
    textDisabled:      '#C8C8C8',
    textInverse:       '#FFFFFF',
    textOnAccent:      '#FFFFFF',

    // Brand / Accent
    accent:            '#0A0A0A',
    accentHover:       '#2A2A2A',
    accentSubtle:      '#F0F0F0',

    // Semantic — monochromatic
    success:           '#1A1A1A',
    successBg:         '#F2F5F2',
    successBorder:     '#D4E0D4',
    warning:           '#3A3A00',
    warningBg:         '#FAFAF0',
    warningBorder:     '#E0E0AA',
    error:             '#2A0A0A',
    errorBg:           '#FFF5F5',
    errorBorder:       '#E0CCCC',
    info:              '#0A1A2A',
    infoBg:            '#F0F5FA',

    // Priority badges (black scale)
    priorityHigh:      '#0A0A0A',
    priorityHighBg:    '#F0F0F0',
    priorityMed:       '#4A4A4A',
    priorityMedBg:     '#F7F7F7',
    priorityLow:       '#9A9A9A',
    priorityLowBg:     '#FAFAFA',

    // Event type chips
    eventMeeting:      '#0A0A0A',
    eventMeetingBg:    '#EBEBEB',
    eventTask:         '#2A2A2A',
    eventTaskBg:       '#F3F3F3',
    eventFocus:        '#1A1A1A',
    eventFocusBg:      '#EAEAEA',
    eventBreak:        '#6A6A6A',
    eventBreakBg:      '#F8F8F8',

    // Timer / Focus ring
    timerRing:         '#0A0A0A',
    timerTrack:        '#E8E8E8',
    timerText:         '#0A0A0A',

    // Message bubbles
    bubbleUser:        '#0A0A0A',
    bubbleUserText:    '#FFFFFF',
    bubbleAI:          '#F3F3F3',
    bubbleAIText:      '#0A0A0A',

    // Cards
    cardBg:            '#FFFFFF',
    cardBorder:        '#EBEBEB',
    cardShadow:        'rgba(0,0,0,0.06)',
    cardShadowStrong:  'rgba(0,0,0,0.14)',

    // Tab bar
    tabBar:            '#FFFFFF',
    tabBarBorder:      '#EBEBEB',
    tabActive:         '#0A0A0A',
    tabInactive:       '#CCCCCC',

    // Input
    inputBg:           '#F7F7F7',
    inputBorder:       '#E8E8E8',
    inputFocusBorder:  '#0A0A0A',
    inputPlaceholder:  '#ABABAB',

    // Mood scale (grayscale mapped)
    moodGreat:         '#0A0A0A',
    moodGood:          '#3A3A3A',
    moodOkay:          '#6A6A6A',
    moodLow:           '#9A9A9A',
    moodAwful:         '#CACACA',
  },

  dark: {
    // Backgrounds
    background:        '#080808',
    surface:           '#111111',
    surfaceElevated:   '#1A1A1A',
    surfaceOverlay:    'rgba(255,255,255,0.04)',

    // Borders
    border:            '#222222',
    borderStrong:      '#F0F0F0',
    divider:           '#181818',

    // Text
    textPrimary:       '#F5F5F5',
    textSecondary:     '#AAAAAA',
    textTertiary:      '#606060',
    textDisabled:      '#383838',
    textInverse:       '#0A0A0A',
    textOnAccent:      '#0A0A0A',

    // Brand / Accent
    accent:            '#F5F5F5',
    accentHover:       '#DDDDDD',
    accentSubtle:      '#1A1A1A',

    // Semantic — dark monochromatic
    success:           '#CCDDCC',
    successBg:         '#0F1A0F',
    successBorder:     '#1A2E1A',
    warning:           '#DDDDAA',
    warningBg:         '#1A1A08',
    warningBorder:     '#2A2A14',
    error:             '#DDAAAA',
    errorBg:           '#1A0808',
    errorBorder:       '#2E1414',
    info:              '#AACCDD',
    infoBg:            '#08141A',

    // Priority
    priorityHigh:      '#F5F5F5',
    priorityHighBg:    '#1A1A1A',
    priorityMed:       '#AAAAAA',
    priorityMedBg:     '#141414',
    priorityLow:       '#606060',
    priorityLowBg:     '#0F0F0F',

    // Event chips
    eventMeeting:      '#F0F0F0',
    eventMeetingBg:    '#1E1E1E',
    eventTask:         '#DDDDDD',
    eventTaskBg:       '#181818',
    eventFocus:        '#EEEEEE',
    eventFocusBg:      '#1C1C1C',
    eventBreak:        '#888888',
    eventBreakBg:      '#141414',

    // Timer
    timerRing:         '#F5F5F5',
    timerTrack:        '#222222',
    timerText:         '#F5F5F5',

    // Bubbles
    bubbleUser:        '#F5F5F5',
    bubbleUserText:    '#080808',
    bubbleAI:          '#1A1A1A',
    bubbleAIText:      '#F5F5F5',

    // Cards
    cardBg:            '#111111',
    cardBorder:        '#1E1E1E',
    cardShadow:        'rgba(0,0,0,0.4)',
    cardShadowStrong:  'rgba(0,0,0,0.7)',

    // Tab bar
    tabBar:            '#080808',
    tabBarBorder:      '#1A1A1A',
    tabActive:         '#F5F5F5',
    tabInactive:       '#383838',

    // Input
    inputBg:           '#111111',
    inputBorder:       '#222222',
    inputFocusBorder:  '#F5F5F5',
    inputPlaceholder:  '#505050',

    // Mood
    moodGreat:         '#F5F5F5',
    moodGood:          '#CCCCCC',
    moodOkay:          '#888888',
    moodLow:           '#505050',
    moodAwful:         '#2A2A2A',
  },
};

export type ColorScheme = typeof Colors.light;
