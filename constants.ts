import {SpriteConfig} from './utils/helper';

/**
 * Modern Spy Laboratory Theme
 */
export const THEME = {
  colors: {
    bgDark: '#070C16',
    bgNavy: '#0B111E',
    panelBg: '#0F172A',
    panelBorder: '#334155',
    accentMint: '#4EFA8B',
    accentLavender: '#B497FF',
    accentYellow: '#FFD166',
    accentRed: '#FF5C5C',
    textLight: '#F1F5F9',
    textMuted: '#94A3B8',
    gridLine: '#334155',
    gridLineBright: '#64748B',
    gridCellHover: 'rgba(78, 250, 139, 0.25)',
  },
  fonts: {
    code: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};

/**
 * Configuration for Mission: Code
 */
export const CONFIG = {
  // Game
  title: {
    value: 'Mission: Code',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 800,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 800,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // Theme
  backgroundColor: {
    value: '#0B111E',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#4EFA8B',
    type: 'color',
    label: 'Primary Accent Color',
    group: 'THEME',
  },
  fontFamily: {
    value: 'system-ui, monospace',
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio
  defaultMusicVolume: {
    value: 0.5,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.6,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Grid & Rules
  gridRows: {
    value: 8,
    type: 'number',
    label: 'Grid Rows',
    group: 'Grid',
  },
  gridCols: {
    value: 8,
    type: 'number',
    label: 'Grid Columns',
    group: 'Grid',
  },
  stepDurationMs: {
    value: 300,
    type: 'number',
    label: 'Step Duration (ms)',
    group: 'Rules',
  },
  showPathProjection: {
    value: false,
    type: 'boolean',
    label: 'Show Path Projection',
    group: 'Rules',
  },
  maxLinesOfCode: {
    value: 30,
    type: 'number',
    label: 'Max Lines of Code',
    group: 'Rules',
  },

  // Assets (Dimensions and aspect ratios derived from read_assets_metadata)
  assetBgAspectRatio: {
    value: 1.79167, // 1376 / 768
    type: 'number',
    label: 'Lab Floor Aspect Ratio',
    group: 'ASSETS',
  },
  assetBgWidth: {
    value: 1376,
    type: 'number',
    label: 'Lab Floor Width',
    group: 'ASSETS',
  },
  assetBgHeight: {
    value: 768,
    type: 'number',
    label: 'Lab Floor Height',
    group: 'ASSETS',
  },

  assetAgentAspectRatio: {
    value: 1.51866, // 814 / 536
    type: 'number',
    label: 'Agent Operative Aspect Ratio',
    group: 'ASSETS',
  },
  assetAgentWidth: {
    value: 814,
    type: 'number',
    label: 'Agent Operative Width',
    group: 'ASSETS',
  },
  assetAgentHeight: {
    value: 536,
    type: 'number',
    label: 'Agent Operative Height',
    group: 'ASSETS',
  },

  assetTerminalAspectRatio: {
    value: 0.94309, // 580 / 615
    type: 'number',
    label: 'Terminal Mainframe Aspect Ratio',
    group: 'ASSETS',
  },
  assetTerminalWidth: {
    value: 580,
    type: 'number',
    label: 'Terminal Mainframe Width',
    group: 'ASSETS',
  },
  assetTerminalHeight: {
    value: 615,
    type: 'number',
    label: 'Terminal Mainframe Height',
    group: 'ASSETS',
  },

  assetWallAspectRatio: {
    value: 1.00138, // 724 / 723
    type: 'number',
    label: 'Facility Wall Aspect Ratio',
    group: 'ASSETS',
  },
  assetWallWidth: {
    value: 724,
    type: 'number',
    label: 'Facility Wall Width',
    group: 'ASSETS',
  },
  assetWallHeight: {
    value: 723,
    type: 'number',
    label: 'Facility Wall Height',
    group: 'ASSETS',
  },

  assetLaserAspectRatio: {
    value: 0.97723, // 472 / 483
    type: 'number',
    label: 'Laser Barrier Aspect Ratio',
    group: 'ASSETS',
  },
  assetLaserWidth: {
    value: 472,
    type: 'number',
    label: 'Laser Barrier Width',
    group: 'ASSETS',
  },
  assetLaserHeight: {
    value: 483,
    type: 'number',
    label: 'Laser Barrier Height',
    group: 'ASSETS',
  },

  assetWaypointAspectRatio: {
    value: 0.97055, // 692 / 713
    type: 'number',
    label: 'Waypoint Footprint Aspect Ratio',
    group: 'ASSETS',
  },
  assetWaypointWidth: {
    value: 692,
    type: 'number',
    label: 'Waypoint Footprint Width',
    group: 'ASSETS',
  },
  assetWaypointHeight: {
    value: 713,
    type: 'number',
    label: 'Waypoint Footprint Height',
    group: 'ASSETS',
  },

  assetBuildingElevationAspectRatio: {
    value: 0.50637, // 596 / 1177
    type: 'number',
    label: 'Facility Building Elevation Aspect Ratio',
    group: 'ASSETS',
  },
  assetBuildingElevationWidth: {
    value: 596,
    type: 'number',
    label: 'Facility Building Elevation Width',
    group: 'ASSETS',
  },
  assetBuildingElevationHeight: {
    value: 1177,
    type: 'number',
    label: 'Facility Building Elevation Height',
    group: 'ASSETS',
  },

  playerSprite: {
    value: undefined as SpriteConfig | undefined,
    type: 'sprite',
    label: 'Player Sprite',
    group: 'Visuals',
  },
};

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}

export interface ProgressiveHintData {
  objective: string;
  concept: string;
  syntax: string;
}

export const PROGRESSIVE_HINTS: Record<number, ProgressiveHintData> = {
  1: {
    objective:
      'Navigate Agent Cipher from spawn at B2 to the Mainframe Terminal at G6 without hitting reinforced walls or laser tripwires.',
    concept:
      'Python executes instructions sequentially in strict top-to-bottom order. Write directional commands line-by-line in the exact sequence you want Cipher to move.',
    syntax:
      'Move East along row 2 into column E, move South through the corridor to row 6, then move East to reach G6:\nmove_right(3)\nmove_down(4)\nmove_right(2)',
  },
  2: {
    objective:
      'Maneuver around the central laser barrier by taking the southern detour and heading up to the terminal at G2.',
    concept:
      'A variable stores a value you can reuse in commands. Assign numbers to descriptive variable names (e.g. stride = 3) and pass them as arguments to movement functions.',
    syntax:
      'Define your variables before using them:\nstride = 3\ntraverse = 5\nmove_down(stride)\nmove_right(traverse)\nmove_up(stride)',
  },
  3: {
    objective:
      'Navigate past the security camera corridor to reach the terminal at F6 without getting spotted by the sweeping lens.',
    concept:
      "Automate repetitive moves with 'for i in range(count):'. When the camera is pointing toward your path, use 'wait(1)' to pause Agent Cipher in place until it turns away.",
    syntax:
      'Use a for-loop for repeating movements, and wait when the camera scans your corridor:\nfor i in range(2):\n    move_right(1)\n    wait(1)\nObserve the camera status indicator before moving forward!',
  },
  4: {
    objective:
      'Retrieve the Security Keycard at B6, navigate to door terminal D4, unlock the security door at E4, and reach the mainframe terminal at G7.',
    concept:
      "'has_key' is a Boolean variable with two possible states: True or False. At mission start, 'has_key' is False. When Agent Cipher steps onto B6, 'has_key' becomes True. Navigate to D4 in front of the door at E4, then check 'if has_key:' to call 'unlock_door()'.",
    syntax:
      'Follow the 4-stage infiltration sequence:\n# 1. Collect keycard at B6 (has_key becomes True)\nmove_down(4)\n# 2. Navigate to door terminal at D4\nmove_up(2)\nmove_right(2)\n# 3. Check condition & unlock door\nif has_key:\n    unlock_door()\n# 4. Pass through E4 to terminal at G7\nmove_right(3)\nmove_down(3)',
  },
  5: {
    objective:
      'Infiltrate the Apex Vault at G5 while bypassing rotating surveillance cameras to retrieve the Top Secret Python Manual.',
    concept:
      'To earn clearance for the Master Vault, your script must synthesize all concepts: define a variable, run a for-loop, and evaluate a conditional check.',
    syntax:
      'Combine variables, conditionals, and loops into one master script:\nstep = 1\nif sensor_clear:\n    for i in range(3):\n        move_right(step)\n        move_down(step)\n    move_right(2)',
  },
};

