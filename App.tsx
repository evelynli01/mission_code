// tslint:disable
/* eslint-disable */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  FastForward,
  SkipForward,
  HelpCircle,
  Menu,
  X,
  Shield,
  Star,
  Terminal as TerminalIcon,
  ChevronRight,
  ChevronLeft,
  Info,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Lock,
  Unlock,
  ArrowLeft,
  BookOpen,
  Layers,
  Award,
  Sliders,
  Sparkles,
  Zap,
  Check,
  Code,
} from 'lucide-react';
import {getConfig, THEME, PROGRESSIVE_HINTS, ProgressiveHintData} from './constants';
import {LESSON_MODULES, LessonModule} from './LessonData';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  createFixedStepper,
  drawAsset,
  drawBackground,
  gameAudio,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useInput,
  useIsMobile,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  useRpc,
} from './utils/usePlayground';

// Audio Asset
const BACKGROUND_MUSIC_URL = 'assets/audio/bgm_mission_espionage.mp3';

// Grid Constants
const GRID_COLS = 8;
const GRID_ROWS = 8;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

interface GridPos {
  col: number;
  row: number;
}

export interface CameraConfig {
  id: string;
  col: number;
  row: number;
  facings: ('right' | 'down' | 'left' | 'up')[];
  range: number;
  cycleSeconds: number;
}

export interface SecurityDoorConfig {
  col: number;
  row: number;
  id: string;
}

export interface FloorData {
  id: number;
  floorNumber: number;
  title: string;
  codename: string;
  concept: string;
  conceptTag: string;
  conceptRecap: string;
  isPlayable: boolean;
  briefing: string;
  intelDossier: string;
  start: GridPos;
  terminal: GridPos;
  walls: GridPos[];
  lasers: GridPos[];
  starterCode: string;
  targetSteps: number;
  hints: string[];
  cameras?: CameraConfig[];
  keycards?: GridPos[];
  keycardTile?: GridPos;
  doors?: SecurityDoorConfig[];
  vault?: GridPos;
}

// 5-Story High-Security Facility Hierarchy
const FLOORS: FloorData[] = [
  {
    id: 1,
    floorNumber: 1,
    title: 'Entry Point',
    codename: 'OPERATION CIPHER ENTRY',
    concept: 'Sequencing & Functions',
    conceptTag: 'SEQUENCING',
    conceptRecap:
      'Mastered sequential line-by-line program execution and directional function arguments.',
    isPlayable: true,
    briefing:
      'Infiltrate laboratory sector A. Navigate Agent Cipher through the security partitions and reach the terminal at G6.',
    intelDossier:
      'Ground-level security checkpoint. Security measures consist of static reinforced partition bulkheads and baseline laser tripwires.',
    start: {col: 1, row: 1}, // B2
    terminal: {col: 6, row: 5}, // G6
    walls: [
      {col: 2, row: 2},
      {col: 2, row: 3},
      {col: 3, row: 3},
      {col: 1, row: 4},
      {col: 2, row: 4},
      {col: 5, row: 1},
      {col: 5, row: 2},
      {col: 5, row: 3},
      {col: 3, row: 6},
      {col: 4, row: 6},
      {col: 5, row: 6},
    ],
    lasers: [
      {col: 1, row: 2},
      {col: 3, row: 4},
      {col: 6, row: 4},
    ],
    starterCode:
      '# Mission 01: Infiltrate the Lab\n# Tip: Guide Agent Cipher to the computer terminal.\n# Supported commands: move_right(n), move_up(n), move_left(n), move_down(n)\n\nmove_right(2)',
    targetSteps: 9,
    hints: [
      'The corridor along row 1 (B2 to E2) is completely clear.',
      'From (E, 2), move straight down to (E, 6).',
      'Then turn right 2 tiles to reach the Mainframe Terminal at (G, 6).',
    ],
  },
  {
    id: 2,
    floorNumber: 2,
    title: 'Access Control',
    codename: 'VARIABLE CIPHER LOCK',
    concept: 'Variables & Arguments',
    conceptTag: 'VARIABLES',
    conceptRecap:
      'Mastered Python variable assignment (`identifier = value`) and passing dynamic variables into movement functions.',
    isPlayable: true,
    briefing:
      'Central security access nexus. High-frequency laser coils guard the central lanes. Store traversal steps in Python variables to maneuver through clearance gates.',
    intelDossier:
      'Level 2 biometric access hub. The system utilizes variable-width laser arrays. Writing modular variable statements allows rapid parameter reconfiguration.',
    start: {col: 1, row: 1}, // B2
    terminal: {col: 6, row: 1}, // G2
    walls: [
      {col: 2, row: 0},
      {col: 2, row: 1},
      {col: 3, row: 0},
      {col: 3, row: 1},
      {col: 3, row: 2},
      {col: 4, row: 1},
      {col: 4, row: 2},
      {col: 5, row: 0},
      {col: 5, row: 1},
      {col: 5, row: 2},
      {col: 2, row: 5},
      {col: 3, row: 5},
      {col: 4, row: 5},
      {col: 5, row: 5},
    ],
    lasers: [
      {col: 2, row: 2},
      {col: 4, row: 0},
      {col: 5, row: 3},
      {col: 3, row: 4},
    ],
    starterCode:
      '# Floor 2: Variables & Movement\n# A variable stores a value you can reuse in commands.\n# Variable names do not use quotation marks!\n#\n# Example syntax:\n#   steps = 2\n#   move_right(steps)\n#\n# Define your own variable below and guide Cipher to the terminal:\n',
    targetSteps: 11,
    hints: [
      'Define a variable like `stride = 3` to control vertical drops.',
      'Drop south to row 5 (row index 4) to bypass the top barrier.',
      'Set `traverse = 5` to cross horizontally under the walls, then move up.',
    ],
  },
  {
    id: 3,
    floorNumber: 3,
    title: 'Surveillance',
    codename: 'OPERATION LOOP MATRIX',
    concept: 'For Loops & Iteration',
    conceptTag: 'FOR LOOPS',
    conceptRecap:
      'Mastered programmatic loops to automate repetitive patrol and sensor bypass cycles.',
    isPlayable: true,
    briefing:
      'Deep surveillance grid. Repeating sensor sweeps defend this laboratory level. Deploy a for loop to automate repetitive movement across the repeating barrier corridors.',
    intelDossier:
      'Level 3 Surveillance Core. Rotating patrol drones and repeating laser sweeps defend this wing. Operatives must deploy `for i in range(count):` iteration to automate traversal across repeating defense patterns without duplicating repetitive code lines.',
    start: {col: 1, row: 1}, // B2
    terminal: {col: 5, row: 5}, // F6
    walls: [
      {col: 1, row: 2},
      {col: 1, row: 3},
      {col: 1, row: 4},
      {col: 1, row: 5},
      {col: 3, row: 1},
      {col: 4, row: 1},
      {col: 5, row: 1},
      {col: 2, row: 4},
      {col: 3, row: 5},
      {col: 6, row: 3},
      {col: 6, row: 4},
      {col: 6, row: 5},
    ],
    lasers: [
      {col: 3, row: 0},
      {col: 0, row: 3},
      {col: 4, row: 2},
      {col: 2, row: 3},
    ],
    starterCode:
      '# Floor 3: For Loops & Timed Patrols\n# Use a \'for\' loop to repeat commands without writing them multiple times.\n# The colon (:) starts the loop, and indented lines belong inside it.\n#\n# Example syntax:\n#   for i in range(2):\n#       move_right(1)\n#       wait(1)\n#\n# Write a loop to navigate past the security camera corridor:\n',
    targetSteps: 8,
    hints: [
      'Watch the surveillance camera: it alternates between facing West and scanning North.',
      'Wait until the camera looks away before executing your code.',
      'Use `for i in range(4):` to automate the repeating diagonal staircase.',
    ],
    cameras: [
      {
        id: 'cam-f3',
        col: 4,
        row: 5,
        facings: ['left', 'up'],
        range: 2,
        cycleSeconds: 3.2,
      },
    ],
  },
  {
    id: 4,
    floorNumber: 4,
    title: 'Access Control',
    codename: 'LOGIC GATE BREAKER',
    concept: 'If Statements & Conditions',
    conceptTag: 'CONDITIONALS',
    conceptRecap:
      'Mastered conditional branch logic (`if has_key:`) to evaluate credentials and unlock security bulkheads.',
    isPlayable: true,
    briefing:
      'Sub-vault security mainframe. The security door is locked at E4. Find the keycard at B6, check whether Agent Cipher has it using a Python conditional (`if has_key:`), and unlock the door to reach the terminal at G7.',
    intelDossier:
      'Level 4 Dynamic Security Hub. The central partition is reinforced with security bulkheads. Operatives must acquire the security keycard at B6 and deploy conditional branch logic `if has_key:` to evaluate keycard authorization before unlocking the high-security electronic door.',
    start: {col: 1, row: 1}, // B2
    terminal: {col: 6, row: 6}, // G7
    walls: [
      {col: 4, row: 0}, // E1
      {col: 4, row: 1}, // E2
      {col: 4, row: 2}, // E3
      {col: 4, row: 4}, // E5
      {col: 4, row: 5}, // E6
      {col: 4, row: 6}, // E7
      {col: 4, row: 7}, // E8
    ],
    lasers: [],
    starterCode:
      '# Floor 4: Conditionals\n# An if statement checks whether something is true.\n# Use a colon (:) and indent the commands inside.\n\n# Example syntax:\n# if has_key:\n#     unlock_door()\n# else:\n#     print("Find the keycard first.")\n\n# Find the keycard, unlock the door,\n# and reach the terminal.\n# Write your mission code below:\n',
    targetSteps: 14,
    hints: [
      'A vertical partition along column E divides the facility, with the locked door at E4.',
      'Head south to B6 (move_down(4)) to acquire the Security Keycard.',
      'Evaluate `if has_key:`, call `unlock_door()`, then navigate through E4 to terminal G7.',
    ],
    keycards: [{col: 1, row: 5}], // B6
    doors: [{col: 4, row: 3, id: 'door-f4'}], // E4
  },
  {
    id: 5,
    floorNumber: 5,
    title: 'The Vault',
    codename: 'OPERATION PYTHON ARCHIVE',
    concept: 'Master Script Execution',
    conceptTag: 'SYNTHESIS',
    conceptRecap:
      'Retrieved the Top Secret Python Manual! Mastered variables, loops, conditionals, and sequential execution.',
    isPlayable: true,
    briefing:
      'The Facility Apex Vault. Combine variables, loops, and conditionals into a master script to bypass surveillance, unlock the vault, and claim the Top Secret Python Manual.',
    intelDossier:
      'FINAL OBJECTIVE: The Supreme Vault at the apex of the facility. Houses the classified artifact "Top Secret Python Manual". Protected by rotating surveillance cameras and quantum bulkheads. Only operatives who synthesize Sequencing, Variables, Loops, and Conditionals may unlock the final cipher vault.',
    start: {col: 1, row: 1}, // B2
    terminal: {col: 6, row: 4}, // G5
    walls: [
      {col: 1, row: 2},
      {col: 1, row: 3},
      {col: 3, row: 1},
      {col: 4, row: 1},
      {col: 5, row: 1},
      {col: 5, row: 2},
      {col: 2, row: 4},
      {col: 3, row: 5},
      {col: 4, row: 6},
      {col: 6, row: 2},
      {col: 6, row: 3},
    ],
    lasers: [
      {col: 2, row: 3},
      {col: 4, row: 2},
      {col: 5, row: 5},
    ],
    starterCode:
      '# Floor 5: Master Vault Infiltration\n# Synthesize all concepts to breach the high-security vault:\n#   [ ] 1. Define a variable and use it in a movement command\n#   [ ] 2. Execute a \'for\' loop to navigate corridor patterns\n#   [ ] 3. Use an \'if\' statement to verify security status\n#\n# Write your script below to retrieve the Top Secret Python Manual:\n',
    targetSteps: 8,
    hints: [
      'The Apex Vault requires demonstrating variables, loops, and conditionals.',
      'Watch the surveillance camera at F4 and time your entry into the vault chamber.',
      'Wrap your loop inside `if sensor_clear:` to satisfy all three clearance protocols.',
    ],
    cameras: [
      {
        id: 'cam-f5',
        col: 5,
        row: 3,
        facings: ['right', 'down'],
        range: 2,
        cycleSeconds: 3.5,
      },
    ],
    vault: {col: 6, row: 4},
  },
];

export interface VisualTarget {
  name: string;
  description: string;
  icon: string;
}

export interface MechanicIntelConfig {
  floorId: number;
  title: string;
  subtitle: string;
  explanation: string;
  visualTargets: VisualTarget[];
  consequences: string;
  actionLabel: string;
}

export const MECHANIC_INTEL_CONFIGS: Record<number, MechanicIntelConfig> = {
  3: {
    floorId: 3,
    title: 'SECURITY INTEL — SURVEILLANCE CAMERAS',
    subtitle: 'Automated Sweeping Vision Sensors',
    explanation:
      "This is a security camera. Its viewing area shows where it can detect Agent Cipher. Watch its patrol pattern and move when it's safe. If you're caught, the current mission attempt must restart.",
    visualTargets: [
      {
        name: 'Camera & Vision Cone [E6]',
        description:
          'Pivoting optical sensor projecting an active detection beam across corridor tiles. Watch its patrol pattern and move when it is safe.',
        icon: '📷',
      },
      {
        name: 'Surveillance Cycle & Timing',
        description:
          "Cameras follow a fixed patrol sweep. Observe the sweep angle and advance when looking away. Use wait(1) if you need to pause.",
        icon: '⏱️',
      },
    ],
    consequences:
      'Detection results in immediate Mission Compromised status and current attempt restart.',
    actionLabel: 'Got It',
  },
  4: {
    floorId: 4,
    title: 'SECURITY INTEL — ACCESS CONTROL',
    subtitle: 'Security Keycards & Electronic Bulkheads',
    explanation:
      'Security door access protocol: collect the security keycard at B6 (sets has_key = True), move to door terminal D4, then use conditional branch logic if has_key: to unlock the door at E4.',
    visualTargets: [
      {
        name: 'Step 1: Security Keycard [B6]',
        description:
          'Move Agent Cipher onto tile B6 to collect the keycard. The Boolean variable has_key updates from False to True.',
        icon: '💳',
      },
      {
        name: 'Step 2: Door Terminal [D4] & Locked Door [E4]',
        description:
          'Move to D4 directly in front of the door at E4. Evaluate if has_key: and call unlock_door() to open the bulkhead and reach G7.',
        icon: '🚪',
      },
    ],
    consequences:
      'Attempting to pass through locked doors without keycard authorization stops movement at the boundary with ACCESS DENIED.',
    actionLabel: 'Got It',
  },
  5: {
    floorId: 5,
    title: 'FINAL MISSION INTEL — THE MASTER VAULT',
    subtitle: 'Apex High-Security Archive & Final Target',
    explanation:
      'The Master Vault holds the classified Top Secret Python Manual. Synthesize variables, loops, and conditionals into a master script to bypass surveillance and claim the manual.',
    visualTargets: [
      {
        name: 'Master Vault [G5]',
        description:
          'Quantum-sealed apex vault holding the classified Top Secret Python Manual at the facility peak.',
        icon: '🏦',
      },
      {
        name: 'Top Secret Python Manual',
        description:
          'The ultimate espionage objective: complete classified Python programming manual.',
        icon: '📜',
      },
    ],
    consequences:
      'Detection results in immediate Mission Compromised status and current attempt restart.',
    actionLabel: 'Got It',
  },
};

export interface ConceptTelemetry {
  usedVariableInMovement: boolean;
  executedMovementLoop: boolean;
  executedConditionalBranch: boolean;
  variablesUsed: string[];
  unlockedDoorInsideConditional?: boolean;
}

interface CommandStep {
  type?: 'move' | 'wait' | 'unlock_door';
  direction?: 'right' | 'left' | 'up' | 'down';
  lineIndex: number;
  stepNum: number;
  totalInCommand: number;
  isFromVariable?: boolean;
  isInsideLoop?: boolean;
  isInsideConditional?: boolean;
  controlledByKeyConditional?: boolean;
  variableName?: string;
  hasKeycardAtStep?: boolean;
}

interface ParseResult {
  steps: CommandStep[];
  telemetry: ConceptTelemetry;
  error?: {
    line: number;
    message: string;
    suggestion?: string;
  };
}

export function isConceptSatisfied(
  floorId: number,
  telemetry: ConceptTelemetry,
): boolean {
  switch (floorId) {
    case 1:
      // Floor 1 (Sequencing & Functions): Preserve existing completion behavior
      return true;
    case 2:
      // Floor 2 (Variables): Must define at least one numeric variable and use it as an argument in an executed movement command
      return telemetry.usedVariableInMovement;
    case 3:
      // Floor 3 (Loops): Must successfully execute at least one for loop that performs movement
      return telemetry.executedMovementLoop;
    case 4:
      // Floor 4 (Conditionals): Must execute a conditional statement (if has_key) that controlled unlocking the security door
      return (
        telemetry.executedConditionalBranch &&
        telemetry.unlockedDoorInsideConditional === true
      );
    case 5:
      // Floor 5 (Combined Concepts): Must execute all three during the mission
      return (
        telemetry.usedVariableInMovement &&
        telemetry.executedMovementLoop &&
        telemetry.executedConditionalBranch
      );
    default:
      return true;
  }
}

export function getConceptMissingFeedback(floorId: number): {
  message: string;
  suggestion: string;
} {
  switch (floorId) {
    case 2:
      return {
        message:
          'Almost there, Agent! You reached the terminal, but this mission requires you to use a variable in a movement command.',
        suggestion:
          'Define a variable (e.g. stride = 3) and pass it into your movement call: move_right(stride).',
      };
    case 3:
      return {
        message:
          'Nice navigation! Now try using a for loop to repeat at least one movement command.',
        suggestion:
          'Use for step in range(count): and indent your movement command inside the loop body.',
      };
    case 4:
      return {
        message:
          "Almost there, Agent! You reached the terminal, but Floor 4 requires evaluating a conditional (`if has_key:`) to control the door unlocking action.",
        suggestion:
          'Wrap unlock_door() inside an if block: `if has_key:` followed by indented `unlock_door()` at door terminal D4.',
      };
    case 5:
      return {
        message:
          'Final challenge: demonstrate variables, loops, and conditionals to complete your training.',
        suggestion:
          'Make sure your script includes at least one variable in movement, one for-loop, and one conditional branch.',
      };
    default:
      return {
        message: 'Almost there, Agent! Check floor requirements.',
        suggestion: 'Review your code and retry.',
      };
  }
}

export interface HazardEvent {
  floorId: number;
  eventType: 'laser' | 'wall' | 'syntax' | 'security_breach' | string;
  heading: string;
  message: string;
  affectedTile?: {col: number; row: number};
  penalizeRating: boolean;
  suggestion?: string;
  line?: number;
}

export function calculateStars(penalties: number): number {
  if (penalties === 0) return 3;
  if (penalties === 1) return 2;
  return 1;
}

interface SaveData {
  unlockedFloors: number[];
  completedFloors: number[];
  highScores: Record<number, number>;
  savedCode: Record<number, string>;
  hasCompletedTraining: boolean;
  floorRatings: Record<number, number>;
  ratings?: Record<number, number>;
}

const SAVE_KEY = 'mission_code_save_v1';
const TOUR_COMPLETED_KEY = 'mission_code_tour_completed_v1';
const FIRST_MOVE_KEY = 'mission_code_first_move_v1';
const BRIEFING_SEEN_FLOOR_1_KEY = 'mission_code_briefing_seen_floor_1';

// Onboarding Walkthrough Steps Configuration
interface TourStepConfig {
  target: 'agent' | 'terminal' | 'editor' | 'run-btn' | 'tools';
  title: string;
  badge: string;
  icon: string;
  description: string;
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    target: 'agent',
    title: 'WELCOME TO YOUR MISSION',
    badge: 'OPERATIVE',
    icon: '🕵️',
    description:
      "You're Agent Cipher, a secret operative navigating a high-security facility. Use Python commands to move through each floor and reach your objective.",
    preferredPlacement: 'right',
  },
  {
    target: 'terminal',
    title: 'Find Your Objective',
    badge: 'OBJECTIVE',
    icon: '💻',
    description:
      'Your mission goal is the Mainframe Terminal at (G, 6). Navigate Cipher safely across the lab floor while avoiding reinforced walls and hazardous laser tripwires.',
    preferredPlacement: 'left',
  },
  {
    target: 'editor',
    title: 'Write Your Commands',
    badge: 'COMMANDS',
    icon: '📝',
    description:
      'Movement functions like move_right(n) and move_down(n) execute strictly in order from top to bottom. Tap the touch chips or write commands directly in the editor.',
    preferredPlacement: 'left',
  },
  {
    target: 'run-btn',
    title: 'Run Your Code',
    badge: 'EXECUTE',
    icon: '▶️',
    description:
      'Press Run Code (or press Ctrl+Enter) to execute your program. Retries are unlimited with zero penalties—experiment freely to find the best route!',
    preferredPlacement: 'top',
  },
  {
    target: 'tools',
    title: 'Explore Your Tools',
    badge: 'NAVIGATION',
    icon: '🗺️',
    description:
      'Need syntax help or want to inspect facility clearance? Use the Field Guide for Python syntax reference, and the Facility Map to review all 5 stories.',
    preferredPlacement: 'bottom',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function OnboardingTour({
  isOpen,
  step,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const currentStep = TOUR_STEPS[step] || TOUR_STEPS[0];

  // Measure target element position
  useEffect(() => {
    if (!isOpen) return;

    const measure = () => {
      const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
        }
      }
    };

    measure();
    const timer1 = setTimeout(measure, 30);
    const timer2 = setTimeout(measure, 120);
    const handleResizeOrScroll = () => measure();

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, step, currentStep.target]);

  // Focus management: store previous active element when opened and restore when closed
  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }
      return () => {
        const prev = previousActiveElementRef.current;
        if (
          prev &&
          typeof prev.focus === 'function' &&
          document.body.contains(prev)
        ) {
          setTimeout(() => prev.focus(), 15);
        } else {
          setTimeout(() => {
            const runBtn = document.querySelector(
              '[data-tour="run-btn"]',
            ) as HTMLElement;
            runBtn?.focus();
          }, 15);
        }
      };
    }
  }, [isOpen]);

  // Auto-focus Next/Finish button on open and on every step change to anchor keyboard focus
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        nextBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  // Keyboard accessibility listeners: Space, ArrowRight, ArrowLeft, Tab/Shift+Tab focus trap, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const activeEl = document.activeElement as HTMLElement | null;
      const isInput =
        (target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)) ||
        (activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.tagName === 'SELECT' ||
            activeEl.isContentEditable));

      if (isInput) return;

      // 1. Escape: Dismiss/close tutorial
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onSkip();
        return;
      }

      // 2. Tab / Shift+Tab: Focus trap within the tutorial dialog controls
      if (e.key === 'Tab') {
        if (!cardRef.current) return;
        const focusableElements = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (el) =>
            el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0,
        );

        if (focusableElements.length > 0) {
          const firstEl = focusableElements[0];
          const lastEl = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (activeEl === firstEl || !cardRef.current.contains(activeEl)) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (activeEl === lastEl || !cardRef.current.contains(activeEl)) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
        return;
      }

      // 3. ArrowLeft: Return to previous step when step > 0
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        if (step > 0) {
          onPrev();
        }
        return;
      }

      // 4. ArrowRight: Advance to next step (or finish tutorial on step 5)
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        onNext();
        return;
      }

      // 5. Space: Advances to next step (or finishes tutorial) when focus is NOT on another interactive control (e.g. Back, Skip, Close)
      if (e.key === ' ' || e.code === 'Space') {
        const isOtherButtonFocused =
          activeEl instanceof HTMLButtonElement &&
          activeEl !== nextBtnRef.current;

        if (!isOtherButtonFocused) {
          e.preventDefault();
          e.stopPropagation();
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, step, onNext, onPrev, onSkip]);

  if (!isOpen) return null;

  // Compute spotlight cutout bounds
  const pad = 8;
  const cutout = targetRect
    ? {
        x: Math.max(0, targetRect.left - pad),
        y: Math.max(0, targetRect.top - pad),
        width: targetRect.width + pad * 2,
        height: targetRect.height + pad * 2,
      }
    : {
        x: window.innerWidth / 2 - 60,
        y: window.innerHeight / 2 - 60,
        width: 120,
        height: 120,
      };

  // Compute dynamic tooltip placement preventing overlap with the highlighted tile
  const cardW = Math.min(360, window.innerWidth - 32);
  const cardH = 220; // Estimated height for clamping
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  let placement = currentStep.preferredPlacement;

  // Adaptive fallback if preferred placement has insufficient space
  if (placement === 'left' && cutout.x - cardW - 16 < 0) {
    placement = cutout.x + cutout.width + cardW + 16 <= winW ? 'right' : (cutout.y > cardH + 20 ? 'top' : 'bottom');
  } else if (placement === 'right' && cutout.x + cutout.width + cardW + 16 > winW) {
    placement = cutout.x - cardW - 16 >= 0 ? 'left' : (cutout.y > cardH + 20 ? 'top' : 'bottom');
  } else if (placement === 'top' && cutout.y - cardH - 16 < 0) {
    placement = cutout.y + cutout.height + cardH + 16 <= winH ? 'bottom' : (cutout.x - cardW - 16 >= 0 ? 'left' : 'right');
  } else if (placement === 'bottom' && cutout.y + cutout.height + cardH + 16 > winH) {
    placement = cutout.y - cardH - 16 >= 0 ? 'top' : (cutout.x - cardW - 16 >= 0 ? 'left' : 'right');
  }

  let posX = 0;
  let posY = 0;

  if (placement === 'left') {
    posX = cutout.x - cardW - 14;
    posY = cutout.y + cutout.height / 2 - cardH / 2;
  } else if (placement === 'right') {
    posX = cutout.x + cutout.width + 14;
    posY = cutout.y + cutout.height / 2 - cardH / 2;
  } else if (placement === 'top') {
    posX = cutout.x + cutout.width / 2 - cardW / 2;
    posY = cutout.y - cardH - 14;
  } else {
    // bottom
    posX = cutout.x + cutout.width / 2 - cardW / 2;
    posY = cutout.y + cutout.height + 14;
  }

  // Final screen clamping with anti-overlap guard over highlighted tile
  let clampedX = Math.max(16, Math.min(winW - cardW - 16, posX));
  let clampedY = Math.max(16, Math.min(winH - cardH - 16, posY));

  if (step === 0) {
    clampedX = Math.max(16, Math.round((winW - cardW) / 2));
    clampedY = Math.max(16, Math.round((winH - cardH) / 2));
  } else {
    if (placement === 'top' && clampedY + cardH > cutout.y - 6) {
      clampedY = Math.max(16, cutout.y - cardH - 12);
    } else if (placement === 'bottom' && clampedY < cutout.y + cutout.height + 6) {
      clampedY = Math.min(winH - cardH - 16, cutout.y + cutout.height + 12);
    }
  }

  const isLastStep = step === TOUR_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gameplay Onboarding Walkthrough"
      aria-labelledby="tour-step-title"
      aria-describedby="tour-step-desc"
      className="fixed inset-0 z-50 select-none">
      {/* Invisible Screen Reader Announcement for Step Changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {step + 1} of {TOUR_STEPS.length}: {currentStep.title}.{' '}
        {currentStep.description}
      </div>

      {/* SVG Spotlight Mask Backdrop */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-10"
        aria-hidden="true">
        <defs>
          <mask id="onboarding-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {step !== 0 && (
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.width}
                height={cutout.height}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop Dimmer (65% dark navy) */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(7, 12, 22, 0.68)"
          mask="url(#onboarding-tour-mask)"
          className="pointer-events-auto cursor-default"
        />

        {/* Illuminated Target Halo Outline */}
        {step !== 0 && (
          <rect
            x={cutout.x}
            y={cutout.y}
            width={cutout.width}
            height={cutout.height}
            rx="12"
            ry="12"
            fill="none"
            stroke="#4EFA8B"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
        )}
      </svg>

      {/* Floating High-Contrast Tooltip Card */}
      <div
        ref={cardRef}
        style={{
          position: 'fixed',
          left: `${clampedX}px`,
          top: `${clampedY}px`,
          width: `${cardW}px`,
        }}
        className="z-20 bg-[#0F172A] border-2 border-[#4EFA8B] rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex flex-col space-y-3 font-sans transition-all duration-150 motion-reduce:transition-none">
        {/* Top Header: Step Indicator, Category Tag & Close button */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">
              {currentStep.icon}
            </span>
            <span
              id="tour-step-title"
              tabIndex={-1}
              className="font-mono font-bold text-xs sm:text-sm text-white uppercase tracking-wider outline-none">
              {currentStep.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/50 text-[#FFD166]">
              {currentStep.badge}
            </span>
            <button
              onClick={onSkip}
              title="Close Tutorial (Escape)"
              aria-label="Close tutorial (Escape)"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Step Description */}
        <p
          id="tour-step-desc"
          className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
          {currentStep.description}
        </p>

        {/* Step Progress & Navigation Buttons */}
        <div className="pt-2 border-t border-slate-700/80 flex flex-col gap-2.5">
          {/* Progress Indicators */}
          <div
            className="flex items-center justify-between text-[11px] font-mono text-slate-300"
            aria-live="polite"
            aria-atomic="true">
            <span>
              Step <strong className="text-[#4EFA8B]">{step + 1}</strong> of{' '}
              {TOUR_STEPS.length}: {currentStep.title}
            </span>

            <div className="flex items-center gap-1.5" aria-hidden="true">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                    i === step
                      ? 'w-5 bg-[#4EFA8B]'
                      : i < step
                      ? 'w-2 bg-[#B497FF]'
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons: Skip, Back, Next/Finish */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onSkip}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1.5 py-1">
              Skip Tutorial
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-xs font-bold transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>
              )}

              <button
                ref={nextBtnRef}
                onClick={onNext}
                className="px-4 py-1.5 rounded-lg bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs transition-all flex items-center gap-1 shadow-md shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95">
                <span>{isLastStep ? "Let's Go!" : 'Next'}</span>
                {isLastStep ? <Check size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Computes the active facing orientation of a rotating/patrolling camera.
 */
export function getCameraCurrentFacing(
  cam: CameraConfig,
  timer: number,
): 'right' | 'down' | 'left' | 'up' {
  if (!cam.facings || cam.facings.length === 0) return 'right';
  const totalPeriod = cam.cycleSeconds * cam.facings.length;
  const currentSlot = Math.floor((timer % totalPeriod) / cam.cycleSeconds);
  return cam.facings[currentSlot % cam.facings.length];
}

/**
 * Computes the tiles covered by a camera's vision cone.
 * Vision rays stop when obstructed by walls or locked security doors.
 */
export function getCameraVisionTiles(
  cam: CameraConfig,
  currentFacing: 'right' | 'down' | 'left' | 'up',
  walls: GridPos[],
  doors: SecurityDoorConfig[] = [],
  hasKeycard = false,
): GridPos[] {
  const tiles: GridPos[] = [];
  let c = cam.col;
  let r = cam.row;

  for (let step = 1; step <= cam.range; step++) {
    if (currentFacing === 'right') c++;
    else if (currentFacing === 'down') r++;
    else if (currentFacing === 'left') c--;
    else if (currentFacing === 'up') r--;

    if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) break;
    // Walls block vision
    if (walls.some((w) => w.col === c && w.row === r)) break;
    // Locked doors block vision
    if (!hasKeycard && doors.some((d) => d.col === c && d.row === r)) break;

    tiles.push({col: c, row: r});
  }

  return tiles;
}

const FLOOR_SLICES: {
  id: number;
  top: string;
  height: string;
  elevation: string;
  sectorTag: string;
}[] = [
  {
    id: 5,
    top: '0%',
    height: '20%',
    elevation: '120m',
    sectorTag: 'APEX VAULT',
  },
  {
    id: 4,
    top: '20%',
    height: '20%',
    elevation: '90m',
    sectorTag: 'SECURITY CORE',
  },
  {
    id: 3,
    top: '40%',
    height: '20%',
    elevation: '60m',
    sectorTag: 'SURVEILLANCE',
  },
  {
    id: 2,
    top: '60%',
    height: '20%',
    elevation: '30m',
    sectorTag: 'ACCESS CONTROL',
  },
  {
    id: 1,
    top: '80%',
    height: '20%',
    elevation: '0m',
    sectorTag: 'GROUND ENTRY',
  },
];

interface FacilityElevationViewerProps {
  selectedFloorId: number;
  onSelectFloor: (floorId: number) => void;
  unlockedFloors: number[];
  completedFloors: number[];
  buildingImg: HTMLImageElement | null | undefined;
  onLockedClick?: (floor: FloorData) => void;
  compact?: boolean;
  floorRatings?: Record<number, number>;
}

function FacilityElevationViewer({
  selectedFloorId,
  onSelectFloor,
  unlockedFloors,
  completedFloors,
  buildingImg,
  onLockedClick,
  compact = false,
  floorRatings = {},
}: FacilityElevationViewerProps) {
  const [hoveredFloorId, setHoveredFloorId] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      {/* High-tech Blueprint Frame Container */}
      <div className="w-full bg-[#070C16] border-2 border-[#1E293B] rounded-2xl p-3 sm:p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

        {/* Top Scanner Header */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#1E293B] z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4EFA8B] animate-pulse" />
            <span className="font-mono font-bold text-[11px] text-slate-100 tracking-wider uppercase">
              FACILITY ARCHITECTURAL SCANNER
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#4EFA8B] bg-emerald-950/80 border border-emerald-500/60 px-2 py-0.5 rounded font-bold tracking-wide">
            ORTHOGRAPHIC // 5 STORIES
          </span>
        </div>

        {/* Building Container with Aspect Ratio 596 / 1177 */}
        <div
          className={`relative w-full ${
            compact ? 'max-w-[210px]' : 'max-w-[300px] sm:max-w-[340px] md:max-w-[370px]'
          } aspect-[596/1177] mx-auto select-none my-1`}>
          {/* Elevation ruler ticks along the left border */}
          <div className="absolute -left-6 sm:-left-7 top-0 bottom-0 flex flex-col justify-between py-2 text-[9px] font-mono text-slate-300 font-bold select-none pointer-events-none z-10">
            {FLOOR_SLICES.map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <span>{s.elevation}</span>
                <span className="w-2 h-[1.5px] bg-[#4EFA8B]/60" />
              </div>
            ))}
          </div>

          {/* Building Image or Fallback */}
          {buildingImg &&
          buildingImg.complete &&
          buildingImg.naturalWidth > 0 ? (
            <img
              src={buildingImg.src}
              alt="5-Story Facility Architectural Elevation"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)] filter contrast-105"
            />
          ) : (
            /* Stylized Technical Fallback Blueprint */
            <div className="w-full h-full bg-[#0B111E] border-2 border-cyan-800/60 rounded-xl flex flex-col justify-between p-2 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(78,250,139,0.06)_50%,transparent_51%)] [background-size:100%_10px] pointer-events-none" />
              {[5, 4, 3, 2, 1].map((fNum) => (
                <div
                  key={fNum}
                  className="flex-1 border-b border-cyan-700/30 flex items-center justify-center text-[10px] font-mono text-cyan-300 font-bold">
                  FLOOR {fNum} SCHEMATIC
                </div>
              ))}
            </div>
          )}

          {/* 5 Interactive Floor Highlight Overlays */}
          {FLOOR_SLICES.map((slice) => {
            const isUnlocked = unlockedFloors.includes(slice.id);
            const isCompleted = completedFloors.includes(slice.id);
            const isSelected = selectedFloorId === slice.id;
            const floorData = FLOORS.find((f) => f.id === slice.id);
            const requiredFloor = slice.id - 1;

            return (
              <button
                key={slice.id}
                type="button"
                style={{top: slice.top, height: slice.height}}
                onMouseEnter={() => setHoveredFloorId(slice.id)}
                onMouseLeave={() => setHoveredFloorId(null)}
                onClick={() => {
                  gameAudio.playCrispClick();
                  onSelectFloor(slice.id);
                  if (!isUnlocked && onLockedClick && floorData) {
                    onLockedClick(floorData);
                  }
                }}
                aria-label={`Floor ${slice.id}: ${floorData?.title || ''}, ${
                  isCompleted
                    ? 'Completed'
                    : isUnlocked
                    ? 'Unlocked'
                    : `Locked: Complete Floor ${requiredFloor} to unlock clearance`
                }`}
                className={`absolute inset-x-0 cursor-pointer transition-all duration-200 flex items-center justify-between px-2 sm:px-3 rounded-lg overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070C16] ${
                  isSelected
                    ? 'border-2 border-amber-400 shadow-[0_0_24px_rgba(255,209,102,0.85)] ring-2 ring-amber-400/80 z-30 ' +
                      (isCompleted
                        ? 'bg-emerald-500/40'
                        : isUnlocked
                        ? 'bg-amber-400/35'
                        : 'bg-[#0B111E]/90')
                    : isCompleted
                    ? 'bg-emerald-500/25 hover:bg-emerald-500/40 border-2 border-emerald-400/90 hover:border-emerald-300 shadow-[0_0_18px_rgba(78,250,139,0.45)] z-20'
                    : isUnlocked
                    ? 'bg-purple-950/50 hover:bg-purple-900/60 border-2 border-[#B497FF]/80 hover:border-[#B497FF] z-10'
                    : 'bg-[#070C16]/85 hover:bg-[#070C16]/95 border-2 border-slate-700 hover:border-slate-500 z-10'
                }`}>
                {/* Completed Floor Illuminated Window Glow & Completion Pulse */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(78,250,139,0.3)_0%,transparent_75%)] animate-pulse pointer-events-none" />
                )}

                {/* Active/Selected Floor Warm Ambient Floor Illumination */}
                {isSelected && isUnlocked && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,209,102,0.22)_0%,transparent_80%)] pointer-events-none" />
                )}

                {/* Active scan horizontal beacon line for selected floor */}
                {isSelected && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#FFD166] to-transparent pointer-events-none animate-pulse" />
                )}

                {/* Left Badge: Floor Number + Title preview */}
                <div className="flex items-center gap-1.5 z-10 pointer-events-none">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono font-black text-[11px] border transition-colors shadow-sm ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 ring-1 ring-amber-300'
                        : isCompleted
                        ? 'bg-emerald-500/40 text-[#4EFA8B] border-emerald-400 font-black'
                        : isUnlocked
                        ? 'bg-purple-900/90 text-[#B497FF] border-purple-400 font-bold'
                        : 'bg-slate-900 text-slate-200 border-slate-600'
                    }`}>
                    {slice.id === 5 ? '★' : `F${slice.id}`}
                  </span>

                  <span className="hidden sm:inline font-mono font-bold text-[10px] text-white drop-shadow-md">
                    {floorData?.title}
                  </span>
                </div>

                {/* Right Badge: Floor State Indicator (Locked, Active, Completed) */}
                <div className="flex items-center gap-1 z-10 pointer-events-none font-mono text-[9px] sm:text-[10px]">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[#4EFA8B] font-bold bg-emerald-950/95 border border-emerald-400 px-2 py-0.5 rounded shadow-sm">
                      <Check size={12} className="stroke-[3]" />
                      <span>[✓]</span>
                      <span className="inline-flex items-center gap-0.5 text-[#FFD166] ml-0.5">
                        {Array.from({length: floorRatings[slice.id] || 3}).map((_, si) => (
                          <Star key={si} size={9} className="fill-[#FFD166] text-[#FFD166]" />
                        ))}
                      </span>
                    </span>
                  ) : isSelected && isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-slate-950 font-black bg-amber-400 border border-amber-300 px-2 py-0.5 rounded shadow-md shadow-amber-500/30">
                      <Zap size={11} className="fill-slate-950" />
                      <span>[⚡ ACTIVE]</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[#B497FF] font-bold bg-purple-950/90 border border-[#B497FF] px-1.5 py-0.5 rounded">
                      <Unlock size={11} />
                      <span>[UNLOCKED]</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-200 font-bold bg-slate-950/95 border border-slate-600 px-1.5 py-0.5 rounded shadow-inner" title={`Complete Floor ${requiredFloor} to unlock clearance`}>
                      <Lock size={11} className="text-amber-400" />
                      <span className="hidden md:inline">LOCKED: Complete Floor {requiredFloor}</span>
                      <span className="md:hidden">LOCKED (F{requiredFloor})</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer instruction caption */}
        <div className="w-full flex items-center justify-between pt-2 mt-2 border-t border-[#1E293B] text-[10px] font-mono text-slate-300 z-10">
          <span>Tap any floor slice to inspect intel</span>
          <span className="text-[#FFD166] font-bold">
            Selected: Floor {selectedFloorId}
          </span>
        </div>
      </div>
    </div>
  );
}

interface FacilityGridIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  floor: FloorData;
  onSelectCoord: (coord: GridPos) => void;
}

function FacilityGridIntelModal({
  isOpen,
  onClose,
  floor,
  onSelectCoord,
}: FacilityGridIntelModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => closeBtnRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const startCoord = `${COL_LABELS[floor.start.col]}${ROW_LABELS[floor.start.row]}`;
  const termCoord = `${COL_LABELS[floor.terminal.col]}${ROW_LABELS[floor.terminal.row]}`;
  const wallCoords = floor.walls.map((w) => `${COL_LABELS[w.col]}${ROW_LABELS[w.row]}`);
  const laserCoords = floor.lasers.map((l) => `${COL_LABELS[l.col]}${ROW_LABELS[l.row]}`);

  // Build the complete interactive object table
  const allObjects: {
    id: string;
    coord: string;
    pos: GridPos;
    name: string;
    typeTag: string;
    desc: string;
    badgeStyle: string;
  }[] = [
    {
      id: 'agent',
      coord: startCoord,
      pos: floor.start,
      name: 'Agent Cipher Spawn',
      typeTag: 'START',
      desc: `Row ${ROW_LABELS[floor.start.row]}, Col ${COL_LABELS[floor.start.col]} - Infiltration Entry Point`,
      badgeStyle: 'bg-emerald-950 text-emerald-300 border-emerald-500',
    },
    {
      id: 'terminal',
      coord: termCoord,
      pos: floor.terminal,
      name: 'Mainframe Terminal',
      typeTag: 'OBJECTIVE',
      desc: `Row ${ROW_LABELS[floor.terminal.row]}, Col ${COL_LABELS[floor.terminal.col]} - Target Data System [💻]`,
      badgeStyle: 'bg-amber-950 text-amber-300 border-amber-500',
    },
    ...floor.walls.map((w, idx) => ({
      id: `wall-${idx}`,
      coord: `${COL_LABELS[w.col]}${ROW_LABELS[w.row]}`,
      pos: w,
      name: `Reinforced Wall Bulkhead #${idx + 1}`,
      typeTag: 'BARRIER',
      desc: `Row ${ROW_LABELS[w.row]}, Col ${COL_LABELS[w.col]} - Impassable steel partition [🛡️]`,
      badgeStyle: 'bg-slate-800 text-slate-200 border-slate-600',
    })),
    ...floor.lasers.map((l, idx) => ({
      id: `laser-${idx}`,
      coord: `${COL_LABELS[l.col]}${ROW_LABELS[l.row]}`,
      pos: l,
      name: `Security Laser Grid #${idx + 1}`,
      typeTag: 'HAZARD',
      desc: `Row ${ROW_LABELS[l.row]}, Col ${COL_LABELS[l.col]} - High-voltage tripwire beam [⚠️]`,
      badgeStyle: 'bg-rose-950 text-rose-300 border-rose-500',
    })),
  ];

  return (
    <MenuOverlay tone="neutral" zIndex={70}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="grid-intel-title"
        aria-describedby="grid-intel-desc"
        className="w-full max-w-2xl bg-[#0F172A] border-2 border-[#4EFA8B] rounded-2xl p-5 sm:p-6 shadow-2xl text-left font-mono max-h-[85vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2 text-[#4EFA8B]">
            <Info size={20} />
            <h3
              id="grid-intel-title"
              className="font-bold text-sm sm:text-base text-white uppercase tracking-wider">
              FACILITY GRID INTEL // FLOOR {floor.floorNumber}: {floor.title}
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close Facility Grid Intel (Escape)"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <X size={18} />
          </button>
        </div>

        {/* Narrative Description & Overview Specs */}
        <div
          id="grid-intel-desc"
          className="text-xs text-slate-200 leading-relaxed shrink-0">
          Full tactical layout specifications for active sector. Coordinates use letter column (A&ndash;H) and number row (1&ndash;8).
        </div>

        {/* Dynamic Level Summary Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs shrink-0">
          <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Grid Dimensions
            </span>
            <strong className="text-[#4EFA8B] block text-sm">
              8 x 8 Grid (Columns A&ndash;H, Rows 1&ndash;8)
            </strong>
            <span className="text-[11px] text-slate-400">
              Total 64 cell coordinate tiles
            </span>
          </div>

          <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Key Coordinates
            </span>
            <div className="text-[11px] text-slate-200">
              Agent Cipher starts at:{' '}
              <strong className="text-emerald-300 font-bold">
                {startCoord} (Row {ROW_LABELS[floor.start.row]}, Col {COL_LABELS[floor.start.col]})
              </strong>
            </div>
            <div className="text-[11px] text-slate-200">
              Mainframe Terminal at:{' '}
              <strong className="text-amber-300 font-bold">
                {termCoord} (Row {ROW_LABELS[floor.terminal.row]}, Col {COL_LABELS[floor.terminal.col]})
              </strong>
            </div>
          </div>

          <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-700 space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Reinforced Wall Coordinates ({wallCoords.length} total)
              </span>
              <span className="text-[10px] text-amber-300 font-bold">[🛡️ BARRIERS]</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono break-words leading-relaxed">
              {wallCoords.length > 0 ? wallCoords.join(', ') : 'None'}
            </p>
          </div>

          <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-700 space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Security Laser Grid Coordinates ({laserCoords.length} total)
              </span>
              <span className="text-[10px] text-rose-300 font-bold">[⚠️ HAZARDS]</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono break-words leading-relaxed">
              {laserCoords.length > 0 ? laserCoords.join(', ') : 'None detected in this sector'}
            </p>
          </div>
        </div>

        {/* Interactive Keyboard-Navigable Coordinate Table */}
        <div className="flex-1 min-h-[160px] flex flex-col space-y-2 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Tactical Object Inspection Table ({allObjects.length} items):</span>
            <span className="text-[10px] text-slate-400">Click or press Enter to inspect cell</span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Interactive Tactical Coordinate Grid Object List"
            className="flex-1 overflow-y-auto rounded-xl border border-slate-700 bg-[#070C16] p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="p-2">Coord</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allObjects.map((obj) => (
                  <tr
                    key={obj.id}
                    className="hover:bg-slate-800/60 focus-within:bg-slate-800/80 transition-colors">
                    <td className="p-2 font-bold text-[#FFD166]">{obj.coord}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] border font-bold ${obj.badgeStyle}`}>
                        {obj.typeTag}
                      </span>
                    </td>
                    <td className="p-2 text-slate-300 font-sans text-xs">
                      {obj.name} &bull; {obj.desc}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCoord(obj.pos);
                          gameAudio.playCrispClick();
                        }}
                        aria-label={`Inspect cell ${obj.coord}: ${obj.name}`}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-[#4EFA8B] hover:text-slate-950 text-slate-200 border border-slate-600 font-mono text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Keyboard: Tab & Arrow keys to navigate &bull; Esc to dismiss
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            DONE (ESC)
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

interface MissionBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  floor: FloorData;
}

function MissionBriefingModal({
  isOpen,
  onClose,
  floor,
}: MissionBriefingModalProps) {
  const ackBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => ackBtnRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetCoord = `${COL_LABELS[floor.terminal.col]}${ROW_LABELS[floor.terminal.row]}`;
  const conceptName =
    floor.floorNumber === 1
      ? 'Sequencing'
      : floor.concept;

  return (
    <MenuOverlay tone="neutral" zIndex={65}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-title"
        aria-describedby="briefing-objective"
        className="w-full max-w-lg bg-[#0F172A] border-2 border-[#4EFA8B] rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-left font-mono flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4EFA8B] animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#4EFA8B] font-bold">
              CLASSIFIED MISSION BRIEFING
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Mission Briefing (Escape)"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <X size={18} />
          </button>
        </div>

        {/* Mission Title & Tags */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[#4EFA8B]">
              FLOOR {floor.floorNumber}
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/40 text-[#B497FF]">
              CONCEPT: {conceptName}
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-[#FFD166]">
              TARGET: {targetCoord}
            </span>
          </div>
          <h3
            id="briefing-title"
            className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Operation: {floor.title}
          </h3>
        </div>

        {/* Tactical Parameters Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-[#0B111E] p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Facility Floor
            </span>
            <span className="text-white font-bold">Floor {floor.floorNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Core Concept
            </span>
            <span className="text-[#B497FF] font-bold">{conceptName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Target Mainframe
            </span>
            <span className="text-[#FFD166] font-bold">Grid Cell {targetCoord} 💻</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Operative Spawn
            </span>
            <span className="text-[#4EFA8B] font-bold">
              Grid Cell {COL_LABELS[floor.start.col]}{ROW_LABELS[floor.start.row]} 🕵️
            </span>
          </div>
        </div>

        {/* Objective Narrative */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Mission Objective
          </span>
          <p
            id="briefing-objective"
            className="text-xs sm:text-sm text-slate-100 bg-[#070C16] p-3.5 rounded-xl border border-slate-800 font-sans leading-relaxed">
            {floor.floorNumber === 1
              ? 'Infiltrate laboratory sector A. Navigate Agent Cipher through the security partitions and reach the terminal at G6.'
              : floor.briefing}
          </p>
        </div>

        {/* Tactical Note */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-sans flex items-start gap-2">
          <Sparkles size={15} className="text-[#FFD166] shrink-0 mt-0.5" />
          <span>
            Avoid reinforced partition bulkheads and laser tripwires. Use directional Python commands like <code className="text-[#4EFA8B] font-mono font-bold">move_right(n)</code> to navigate.
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Space</kbd>, <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Enter</kbd>, or <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Esc</kbd>
          </span>
          <button
            ref={ackBtnRef}
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#4EFA8B] hover:bg-emerald-400 active:scale-95 text-slate-950 font-mono font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <Check size={16} />
            <span>Mission Acknowledged</span>
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

interface MechanicBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MechanicIntelConfig;
}

function MechanicBriefingModal({
  isOpen,
  onClose,
  config,
}: MechanicBriefingModalProps) {
  const ackBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => ackBtnRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <MenuOverlay tone="neutral" zIndex={65}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mechanic-intel-title"
        className="w-full max-w-lg bg-[#0F172A] border-2 border-amber-400 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-left font-mono flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
              SECURITY INTEL BRIEFING
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Mechanic Briefing (Escape)"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <X size={18} />
          </button>
        </div>

        {/* Title & Subtitle */}
        <div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-[#FFD166] uppercase">
            FLOOR {config.floorId} INTEL
          </span>
          <h3
            id="mechanic-intel-title"
            className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
            {config.title}
          </h3>
          <p className="text-xs text-[#B497FF] font-mono mt-0.5">
            {config.subtitle}
          </p>
        </div>

        {/* Explanation */}
        <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
          {config.explanation}
        </div>

        {/* Visual Targets */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Tactical Sensor Signatures
          </span>
          <div className="grid grid-cols-1 gap-2">
            {config.visualTargets.map((vt, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#070C16] border border-slate-800 text-xs">
                <span className="text-lg shrink-0 mt-0.5">{vt.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white block font-mono text-[11px]">
                    {vt.name}
                  </span>
                  <span className="text-slate-300 font-sans text-xs">
                    {vt.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consequences Note */}
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-sans flex items-start gap-2">
          <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
          <span>{config.consequences}</span>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Space</kbd> or <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Esc</kbd>
          </span>
          <button
            ref={ackBtnRef}
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-mono font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <Check size={16} />
            <span>{config.actionLabel}</span>
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

interface CameraCompromisedModalProps {
  isOpen: boolean;
  tile?: GridPos;
  onReviewCode: () => void;
  onRestart: () => void;
}

function CameraCompromisedModal({
  isOpen,
  tile,
  onReviewCode,
  onRestart,
}: CameraCompromisedModalProps) {
  const restartBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => restartBtnRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onRestart]);

  if (!isOpen) return null;

  const coordStr = tile ? `${COL_LABELS[tile.col]}${ROW_LABELS[tile.row]}` : 'UNKNOWN';

  return (
    <MenuOverlay tone="neutral" zIndex={65}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compromised-title"
        className="w-full max-w-md bg-[#0F172A] border-2 border-rose-500 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(244,63,94,0.3)] text-left font-mono flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold">
              MISSION COMPROMISED
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500 text-rose-300 font-bold">
            CAMERA DETECTED
          </span>
        </div>

        {/* Compromised Alert */}
        <div>
          <h3
            id="compromised-title"
            className="text-xl font-black text-rose-200 uppercase tracking-tight">
            Security Sweep Alarm Triggered!
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
            Agent Cipher entered an active surveillance vision cone at grid cell <strong className="text-rose-400 font-mono font-bold">[{coordStr}]</strong>. The facility security grid was alerted and this mission attempt must restart.
          </p>
        </div>

        {/* Tactical Recommendation */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-sans space-y-1">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-amber-300">
            <Lightbulb size={14} />
            <span>OPERATIVE INTEL:</span>
          </div>
          <p>
            Surveillance cameras rotate on a fixed sweep timer. Observe the vision beam direction and time your code execution when the camera looks away.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onReviewCode}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs border border-slate-600 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <Code size={14} className="text-[#B497FF]" />
            <span>Review Failed Script</span>
          </button>
          <button
            ref={restartBtnRef}
            type="button"
            onClick={onRestart}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-mono font-black text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <RotateCw size={14} />
            <span>Restart Mission</span>
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

interface FailedCodeReviewModalProps {
  isOpen: boolean;
  code: string;
  onClose: () => void;
  onRestart: () => void;
}

function FailedCodeReviewModal({
  isOpen,
  code,
  onClose,
  onRestart,
}: FailedCodeReviewModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => closeBtnRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <MenuOverlay tone="neutral" zIndex={70}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-code-title"
        className="w-full max-w-lg bg-[#0F172A] border-2 border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl text-left font-mono flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-[#B497FF]" />
            <h3
              id="review-code-title"
              className="font-bold text-sm sm:text-base text-white uppercase tracking-wider">
              FAILED SCRIPT POST-MORTEM
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close Code Review (Escape)"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Here is the exact code script executed when Agent Cipher was detected by surveillance:
        </p>

        {/* Read-Only Code Container */}
        <div className="max-h-60 overflow-y-auto bg-[#070C16] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200">
          {code.split('\n').map((line, idx) => (
            <div key={idx} className="flex gap-3 leading-5">
              <span className="text-slate-600 select-none w-6 text-right shrink-0">
                {idx + 1}
              </span>
              <span className={line.startsWith('#') ? 'text-slate-500 italic' : 'text-[#4EFA8B]'}>
                {line || ' '}
              </span>
            </div>
          ))}
        </div>

        {/* Guidance */}
        <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl text-xs text-purple-200 font-sans">
          <strong>Timing strategy:</strong> Adjust your movements to pass through camera sectors when the sweeping vision cone points away from your route.
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors border border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            Back to Alert (Esc)
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <RotateCw size={14} />
            <span>Restart Mission</span>
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

interface ProgressiveHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  floor: FloorData;
  unlockedLevel: number;
  onUnlockNext: () => void;
}

function ProgressiveHintModal({
  isOpen,
  onClose,
  floor,
  unlockedLevel,
  onUnlockNext,
}: ProgressiveHintModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => closeBtnRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hintData = PROGRESSIVE_HINTS[floor.floorNumber] || PROGRESSIVE_HINTS[1];

  return (
    <MenuOverlay tone="neutral" zIndex={70}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hint-modal-title"
        aria-describedby="hint-modal-desc"
        className="w-full max-w-lg bg-[#0F172A] border-2 border-[#FFD166] rounded-2xl p-5 sm:p-6 shadow-2xl text-left font-mono flex flex-col space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-[#FFD166] border border-amber-400/40">
              <Lightbulb size={18} />
            </span>
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                TACTICAL FIELD HINTS // 3-TIER INTEL
              </span>
              <h3
                id="hint-modal-title"
                className="font-bold text-sm sm:text-base text-white uppercase tracking-tight">
                Floor {floor.floorNumber}: {floor.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#4EFA8B] bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded font-bold">
              ZERO STAR PENALTY
            </span>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close Progressive Hints (Escape)"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <X size={18} />
            </button>
          </div>
        </div>

        <p id="hint-modal-desc" className="text-xs text-slate-300 font-sans leading-relaxed shrink-0">
          Progressive hints provide gentle clues without spoiling the solution or reducing star ratings.
        </p>

        {/* 3 Progressive Hints Cards */}
        <div className="space-y-3">
          {/* HINT 1: Objective Clue (Always visible) */}
          <div className="p-3.5 rounded-xl bg-[#070C16] border border-emerald-500/40 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4EFA8B]">
                <Compass size={14} />
                <span>HINT 1 — OBJECTIVE GUIDANCE</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                UNLOCKED
              </span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {hintData.objective}
            </p>
          </div>

          {/* HINT 2: Concept Clue */}
          {unlockedLevel >= 2 ? (
            <div className="p-3.5 rounded-xl bg-[#070C16] border border-purple-500/40 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#B497FF]">
                  <Code size={14} />
                  <span>HINT 2 — PYTHON CONCEPT &amp; STRATEGY</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/50">
                  UNLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {hintData.concept}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0B111E]/70 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Lock size={15} className="text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-300 block">
                    HINT 2 — Concept &amp; Strategy
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Explains how {floor.concept} assists in navigating this sector.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onUnlockNext}
                className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-600/70 font-mono text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95">
                <span>Unlock Hint 2</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* HINT 3: Syntax & Code Structure */}
          {unlockedLevel >= 3 ? (
            <div className="p-3.5 rounded-xl bg-[#070C16] border border-amber-500/50 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFD166]">
                  <Sparkles size={14} />
                  <span>HINT 3 — SYNTAX &amp; CODE STRUCTURE</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50">
                  UNLOCKED
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-[#4EFA8B] whitespace-pre-wrap leading-relaxed">
                {hintData.syntax}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0B111E]/70 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Lock size={15} className="text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-300 block">
                    HINT 3 — Syntax &amp; Code Outline
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Structural Python code snippet to guide your script without full spoilers.
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={unlockedLevel < 2}
                onClick={onUnlockNext}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 ${
                  unlockedLevel >= 2
                    ? 'bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                }`}>
                <span>Unlock Hint 3</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            Progress: <strong className="text-[#FFD166]">{unlockedLevel} / 3</strong> Hints Unlocked
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            GOT IT (ESC)
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

const getInitialSaveData = (): SaveData => {
  if (typeof window === 'undefined') {
    return {
      unlockedFloors: [1],
      completedFloors: [],
      highScores: {},
      savedCode: {},
      hasCompletedTraining: false,
      floorRatings: {},
    };
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.unlockedFloors)) {
        return {
          ...parsed,
          hasCompletedTraining: !!parsed.hasCompletedTraining,
          floorRatings: parsed.floorRatings || (parsed as any).ratings || {},
        };
      }
    }
  } catch (e) {
    console.error('Failed reading save', e);
  }
  return {
    unlockedFloors: [1],
    completedFloors: [],
    highScores: {},
    savedCode: {},
    hasCompletedTraining: false,
    floorRatings: {},
  };
};

interface CelebrationParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'spark' | 'ring';
}

interface MissionAccomplishedModalProps {
  isOpen: boolean;
  saveData: SaveData;
  onReplayFloor5: () => void;
  onReturnToMap: () => void;
}

function MissionAccomplishedModal({
  isOpen,
  saveData,
  onReplayFloor5,
  onReturnToMap,
}: MissionAccomplishedModalProps) {
  const returnBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        prevActiveRef.current = document.activeElement;
      }
      const t = setTimeout(() => returnBtnRef.current?.focus(), 50);
      return () => {
        clearTimeout(t);
        const prev = prevActiveRef.current;
        if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
          prev.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onReturnToMap();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onReturnToMap]);

  if (!isOpen) return null;

  // Compute total stars & score across all 5 floors
  const totalStars = [1, 2, 3, 4, 5].reduce((sum, floorId) => {
    const r =
      saveData.floorRatings?.[floorId] ??
      saveData.ratings?.[floorId] ??
      (saveData.completedFloors.includes(floorId) ? 3 : 0);
    return sum + r;
  }, 0);

  const totalScore = Object.values(saveData.highScores).reduce(
    (a, b) => a + b,
    0,
  );

  const conceptChecklist = [
    {
      floor: 1,
      title: 'Floor 1: Sequencing & Movement',
      desc: 'Line-by-line program execution and directional traversal',
      tag: 'SEQUENCING',
      tagColor: 'text-[#4EFA8B] bg-emerald-950/80 border-emerald-500/50',
    },
    {
      floor: 2,
      title: 'Floor 2: Variables & Function Arguments',
      desc: 'Named variable assignment and parameterized dynamic arguments',
      tag: 'VARIABLES',
      tagColor: 'text-[#FFD166] bg-amber-950/80 border-amber-500/50',
    },
    {
      floor: 3,
      title: 'Floor 3: For Loops & Timed Patrols',
      desc: 'Automated repetition without duplicate code & surveillance evasion',
      tag: 'FOR LOOPS',
      tagColor: 'text-[#B497FF] bg-purple-950/80 border-purple-500/50',
    },
    {
      floor: 4,
      title: 'Floor 4: Conditionals & Booleans',
      desc: 'Boolean authorization states & conditional door clearance branching',
      tag: 'CONDITIONALS',
      tagColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50',
    },
    {
      floor: 5,
      title: 'Floor 5: Combined Systems Architecture',
      desc: 'Synthesis of variables, loops, and conditions into apex master script',
      tag: 'SYNTHESIS',
      tagColor: 'text-amber-300 bg-amber-900/80 border-amber-400/60',
    },
  ];

  return (
    <MenuOverlay tone="victory" zIndex={80}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="accomplished-headline"
        aria-describedby="accomplished-sub"
        className="w-full max-w-2xl bg-[#0B111E] border-2 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(255,209,102,0.35)] text-left font-mono max-h-[90vh] flex flex-col space-y-5 overflow-y-auto">
        {/* Top Header Badge & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#FFD166] font-bold">
              CLASSIFIED ESPIONAGE DIRECTIVE // LEVEL 5 CLEARANCE
            </span>
          </div>

          <button
            onClick={onReturnToMap}
            aria-label="Return to Facility Map (Escape)"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <X size={18} />
          </button>
        </div>

        {/* Grand Headline & Supporting Messages */}
        <div className="text-center space-y-2 shrink-0">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-[#FFD166] shadow-lg shadow-amber-500/20 mb-1">
            <Award size={36} className="text-[#FFD166]" />
          </div>

          <h2
            id="accomplished-headline"
            className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            MISSION ACCOMPLISHED, AGENT.
          </h2>

          <p
            id="accomplished-sub"
            className="text-sm sm:text-base text-[#4EFA8B] font-bold font-mono">
            The Top Secret Python Manual has been secured.
          </p>

          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl mx-auto leading-relaxed">
            You've completed all five floors and mastered the fundamentals of Python.
          </p>
        </div>

        {/* 3 Metrics Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* 5 / 5 Sectors Cleared */}
          <div className="bg-[#0F172A] border-2 border-emerald-500/60 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Facility Clearance
            </span>
            <div className="flex items-center gap-1.5 text-[#4EFA8B] font-black text-lg sm:text-xl">
              <CheckCircle2 size={20} className="text-[#4EFA8B]" />
              <span>5 / 5 Cleared</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              100% Infiltration
            </span>
          </div>

          {/* Total Stars */}
          <div className="bg-[#0F172A] border-2 border-amber-400/60 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Operational Stars
            </span>
            <div className="flex items-center gap-1.5 text-[#FFD166] font-black text-lg sm:text-xl">
              <Star size={20} className="fill-[#FFD166] text-[#FFD166]" />
              <span>{totalStars} / 15 ★</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">
              Across All 5 Sectors
            </span>
          </div>

          {/* Total High Score */}
          <div className="bg-[#0F172A] border-2 border-purple-500/60 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Cumulative Points
            </span>
            <div className="flex items-center gap-1.5 text-[#B497FF] font-black text-lg sm:text-xl">
              <Sparkles size={18} className="text-[#B497FF]" />
              <span>{totalScore} pts</span>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">
              Classified Cyber Rating
            </span>
          </div>
        </div>

        {/* Visual Artifact: Recovered Top Secret Python Manual Dossier Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#070C16] border-2 border-[#FFD166] shadow-[0_0_30px_rgba(255,209,102,0.25)] relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            {/* Golden Dossier Icon & Emblem */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 p-1 flex flex-col items-center justify-center shadow-2xl shrink-0 border-2 border-amber-300">
              <div className="w-full h-full bg-[#0F172A] rounded-lg flex flex-col items-center justify-center p-1 text-center">
                <span className="text-2xl sm:text-3xl">📜</span>
                <span className="text-[9px] font-mono font-black text-[#FFD166] mt-1 tracking-tighter">
                  TOP SECRET
                </span>
                <span className="text-[7.5px] font-mono font-bold text-[#4EFA8B]">
                  PYTHON.V5
                </span>
              </div>
            </div>

            {/* Dossier Details */}
            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-[#FFD166] text-[10px] font-bold uppercase tracking-wider">
                <Shield size={12} />
                <span>CONFIDENTIAL ESPIONAGE ARTIFACT SECURED</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                TOP SECRET PYTHON MANUAL
              </h3>

              <div className="font-mono text-xs text-[#4EFA8B] font-bold">
                [ &#123; PYTHON 3.X CLASSIFIED ARCHIVE &#125; ]
              </div>

              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                Contains the core syntax, algorithmic blueprints, and automation directives of the Python language. Decrypted from the Apex Vault and safely archived at Headquarters.
              </p>
            </div>
          </div>
        </div>

        {/* Mastered Concepts Summary Checklist */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span className="text-[#FFD166] uppercase tracking-wider">
              Python Curriculum Mastery Checklist (5/5 Cleared):
            </span>
            <span className="text-[#4EFA8B] text-[11px] font-bold">[100% COMPLETE]</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {conceptChecklist.map((item) => (
              <div
                key={item.floor}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#070C16] border border-slate-800 hover:border-slate-700 transition-colors gap-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[#4EFA8B] shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <strong className="block text-white font-mono text-xs truncate">
                      {item.title}
                    </strong>
                    <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* End-of-Game Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onReplayFloor5}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[#FFD166] font-mono font-bold text-xs sm:text-sm border border-amber-500/40 transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <RotateCw size={16} />
            <span>Replay Mission (Floor 5)</span>
          </button>

          <button
            ref={returnBtnRef}
            type="button"
            onClick={onReturnToMap}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#4EFA8B] hover:bg-emerald-400 active:scale-95 text-slate-950 font-mono font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <Layers size={16} />
            <span>Return to HQ / Facility Map</span>
          </button>
        </div>
      </div>
    </MenuOverlay>
  );
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();
  const lastCancelRef = useRef(false);
  const inputRef = useInput(canvasRef);

  // Playground SDK Integration
  const {sdk, isReady} = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');

  // Preloaded Assets
  const ASSETS_MANIFEST = useMemo(
    () => ({
      lab_floor_background: 'assets/images/lab_floor_background.png',
      terminal_mainframe: 'assets/images/terminal_mainframe.png',
      agent_operative: 'assets/images/agent_operative.png',
      footprint_marker: 'assets/images/footprint_marker.png',
      facility_wall_tile: 'assets/images/facility_wall_tile.png',
      laser_barrier_emitter: 'assets/images/laser_barrier_emitter.png',
      facility_building_elevation:
        'assets/images/facility_building_elevation.png',
    }),
    [],
  );
  const {assets, isReady: assetsReady} = useAssets(ASSETS_MANIFEST);

  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs');
    const maxSubSteps = getConfig('maxSubSteps');
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // Multi-Screen Navigation State
  // 'home' | 'building' | 'training' | 'gameplay' | 'debrief'
  const [currentView, setCurrentView] = useState<
    'home' | 'building' | 'training' | 'gameplay' | 'debrief'
  >('home');

  // Active Floor Selection
  const [selectedFloorId, setSelectedFloorId] = useState<number>(1);
  const currentFloor = useMemo(() => {
    return FLOORS.find((f) => f.id === selectedFloorId) || FLOORS[0];
  }, [selectedFloorId]);

  // LocalStorage Persistence
  const [saveData, setSaveData] = useState<SaveData>(getInitialSaveData);

  // Accessible Screen-Reader Announcement & Step Log State
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [chipToast, setChipToast] = useState<{message: string; id: number} | null>(null);
  const [isGridIntelOpen, setIsGridIntelOpen] = useState(false);
  const [isMissionBriefingOpen, setIsMissionBriefingOpen] = useState(false);

  // Reusable Gameplay Mechanic Introduction Modal & Persistence
  const SEEN_MECHANIC_INTEL_KEY = 'mission_code_seen_mechanic_intel_v1';
  const [seenMechanicIntel, setSeenMechanicIntel] = useState<Record<number, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(SEEN_MECHANIC_INTEL_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [isMechanicBriefingOpen, setIsMechanicBriefingOpen] = useState(false);

  // Camera Detection & Mission Compromised State
  const [isCameraCompromised, setIsCameraCompromised] = useState(false);
  const [failedCodeSnapshot, setFailedCodeSnapshot] = useState<string>('');
  const [isReviewingFailedCode, setIsReviewingFailedCode] = useState(false);
  const [compromisedCameraTile, setCompromisedCameraTile] = useState<GridPos | null>(null);
  const cameraTimerRef = useRef(0);

  // Floor 5 Final Ending & Celebration State
  const [isFinalEnding, setIsFinalEnding] = useState(false);
  const finalCelebrationTimerRef = useRef(0);
  const celebrationParticlesRef = useRef<CelebrationParticle[]>([]);
  const [isMissionAccomplishedOpen, setIsMissionAccomplishedOpen] = useState(false);

  // Floor 4 Keycard & Security Door State
  const [hasKeycard, setHasKeycard] = useState(false);
  const hasKeycardRef = useRef(false);
  hasKeycardRef.current = hasKeycard;
  const [isDoorUnlocked, setIsDoorUnlocked] = useState(false);
  const isDoorUnlockedRef = useRef(false);
  isDoorUnlockedRef.current = isDoorUnlocked;
  const hasKey = hasKeycard;

  // Diagnostic state for Floor 4 telemetry readout
  const [agentPos, setAgentPos] = useState<GridPos>({
    col: currentFloor.start.col,
    row: currentFloor.start.row,
  });
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>('none');

  // Progressive Hints Modal State
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [unlockedHintLevels, setUnlockedHintLevels] = useState<Record<number, number>>({});
  const [isStepLogExpanded, setIsStepLogExpanded] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<{
    id: number;
    stepNumber: number;
    line: number;
    direction: string;
    fromCol: number;
    fromRow: number;
    toCol: number;
    toRow: number;
    status: 'ok' | 'wall' | 'laser' | 'perimeter' | 'terminal';
    desc: string;
  }[]>([]);

  const runBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const escapeToExitRef = useRef(false);
  const cursorPositionRef = useRef<{
    start: number;
    end: number;
    hasUserFocused: boolean;
  }>({
    start: 0,
    end: 0,
    hasUserFocused: false,
  });

  const updateCursorPosition = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      cursorPositionRef.current = {
        start: target.selectionStart,
        end: target.selectionEnd,
        hasUserFocused: true,
      };
    },
    [],
  );

  const updateSave = useCallback(
    (updater: (prev: SaveData) => SaveData) => {
      setSaveData((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Save write failed', e);
        }
        return next;
      });
    },
    [],
  );

  const handleDismissBriefing = useCallback(() => {
    gameAudio.playCrispClick();
    setIsMissionBriefingOpen(false);
  }, []);

  // Game Lifecycle State for SDK
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
    moves: 0,
    timer: 0,
  });
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Audio Toggles
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);

  // Modals & Drawers
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isHintDrawerOpen, setIsHintDrawerOpen] = useState(false);
  const [lockedDossierFloor, setLockedDossierFloor] = useState<FloorData | null>(
    null,
  );
  const [showPathProjection, setShowPathProjection] = useState(false);

  // 3-Star Mission Rating & Hazard Tracking State
  const [hazardPenalties, setHazardPenalties] = useState<number>(0);
  const [activeHazardTile, setActiveHazardTile] = useState<GridPos | null>(null);
  const activeHazardTileRef = useRef<GridPos | null>(null);
  activeHazardTileRef.current = activeHazardTile;
  const [currentAttemptStars, setCurrentAttemptStars] = useState<number>(3);

  // Reusable Shared Hazard Event Handler
  const handleHazardFeedback = useCallback((event: HazardEvent) => {
    if (event.penalizeRating) {
      setHazardPenalties((prev) => prev + 1);
    }
    if (event.affectedTile) {
      setActiveHazardTile(event.affectedTile);
      window.setTimeout(() => {
        setActiveHazardTile((cur) => {
          if (
            cur &&
            cur.col === event.affectedTile?.col &&
            cur.row === event.affectedTile?.row
          ) {
            return null;
          }
          return cur;
        });
      }, 3500);
    }
    setStatusFeedback({
      state: 'error',
      title: event.heading,
      body: event.message,
      suggestion: event.suggestion,
      line: event.line,
    });
    setLiveAnnouncement(`${event.heading}: ${event.message}`);
  }, []);

  const handleTogglePath = useCallback(() => {
    gameAudio.playCrispClick();
    setShowPathProjection((prev) => !prev);
  }, []);

  // Onboarding Walkthrough & Milestone States
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(TOUR_COMPLETED_KEY) !== 'true';
    } catch {
      return false;
    }
  });
  const [tourStep, setTourStep] = useState<number>(0);
  const [hasTriedFirstMove, setHasTriedFirstMove] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(FIRST_MOVE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const hasTriedFirstMoveRef = useRef(hasTriedFirstMove);
  hasTriedFirstMoveRef.current = hasTriedFirstMove;
  const [quickStartDismissed, setQuickStartDismissed] = useState(false);
  const [gridTargetRects, setGridTargetRects] = useState<{
    agent: {left: number; top: number; width: number; height: number};
    terminal: {left: number; top: number; width: number; height: number};
  } | null>(null);

  // Exact Spotlight Targets: Computes sub-pixel accurate bounding rectangles for
  // Agent Cipher (at current position / start) and Mainframe Terminal (at destination)
  useEffect(() => {
    if (currentView !== 'gameplay') return;

    const updateRects = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // The 800x800 canvas content is letterboxed inside the DOM element
      const size = Math.min(rect.width, rect.height);
      const offsetX = rect.left + (rect.width - size) / 2;
      const offsetY = rect.top + (rect.height - size) / 2;
      const scale = size / 800;
      const cellSize = 87.5 * scale;

      const agentCol = currentFloor.start.col;
      const agentRow = currentFloor.start.row;
      const termCol = currentFloor.terminal.col;
      const termRow = currentFloor.terminal.row;

      setGridTargetRects({
        agent: {
          left: offsetX + (50 + agentCol * 87.5) * scale,
          top: offsetY + (50 + agentRow * 87.5) * scale,
          width: cellSize,
          height: cellSize,
        },
        terminal: {
          left: offsetX + (50 + termCol * 87.5) * scale,
          top: offsetY + (50 + termRow * 87.5) * scale,
          width: cellSize,
          height: cellSize,
        },
      });
    };

    updateRects();
    const interval = setInterval(updateRects, 200);
    window.addEventListener('resize', updateRects);
    window.addEventListener('scroll', updateRects, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRects);
      window.removeEventListener('scroll', updateRects, true);
    };
  }, [currentView, selectedFloorId, currentFloor]);

  // Code Editor State
  const [code, setCode] = useState<string>(() => {
    return saveData.savedCode[selectedFloorId] || currentFloor.starterCode;
  });
  const [activeExecutingLine, setActiveExecutingLine] = useState<number | null>(
    null,
  );
  const [showShortcutsTip, setShowShortcutsTip] = useState(false);
  const chipToastTimeoutRef = useRef<number | null>(null);
  const [resetToast, setResetToast] = useState<{id: number} | null>(null);
  const resetToastTimerRef = useRef<number | null>(null);

  // Consolidated Contextual Status State (Strictly Mutually Exclusive)
  const [statusFeedback, setStatusFeedback] = useState<{
    state: 'idle' | 'running' | 'success' | 'error' | 'concept_missing';
    title: string;
    body: string;
    suggestion?: string;
    line?: number;
  }>({
    state: 'idle',
    title: 'Ready for Code Execution',
    body: 'Ready for orders. Enter your Python movement commands and press Run Code.',
  });

  // Runtime Executed Concepts Telemetry Ref (for verifying floor requirements)
  const runtimeTelemetryRef = useRef<ConceptTelemetry>({
    usedVariableInMovement: false,
    executedMovementLoop: false,
    executedConditionalBranch: false,
    variablesUsed: [],
  });

  // Execution Engine State
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [executionSpeed, setExecutionSpeed] = useState<1 | 2 | 'instant'>(
    prefersReducedMotion ? 'instant' : 1,
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [errorLineIndex, setErrorLineIndex] = useState<number | null>(null);
  const [inspectedCell, setInspectedCell] = useState<GridPos | null>({
    col: currentFloor.start.col,
    row: currentFloor.start.row,
  });

  // Simulation Refs
  const agentRef = useRef({
    col: currentFloor.start.col,
    row: currentFloor.start.row,
    renderX: 0,
    renderY: 0,
    angle: 0,
    targetCol: currentFloor.start.col,
    targetRow: currentFloor.start.row,
    isMoving: false,
    moveProgress: 0,
  });

  const executionQueueRef = useRef<CommandStep[]>([]);
  const currentQueueIdxRef = useRef(0);
  const pathHistoryRef = useRef<GridPos[]>([]);
  const terminalDecryptedRef = useRef(false);
  const terminalGlowTimerRef = useRef(0);
  const pulsePhaseRef = useRef(0);

  // Interactive Cell Inspector information
  const inspectedInfo = useMemo(() => {
    if (!inspectedCell) {
      return {
        title: 'Lab Corridor',
        desc: 'Clear passable floor tile.',
        tag: 'PASSABLE',
        tone: 'text-slate-200',
      };
    }
    const {col, row} = inspectedCell;
    if (
      currentFloor.vault &&
      currentFloor.vault.col === col &&
      currentFloor.vault.row === row
    ) {
      return {
        title: 'The Master Vault',
        desc: 'Apex Research Vault [★]. Contains the classified Top Secret Python Manual.',
        tag: 'VAULT',
        tone: 'text-amber-400',
      };
    }
    if (
      col === currentFloor.terminal.col &&
      row === currentFloor.terminal.row
    ) {
      return {
        title: 'Mainframe Terminal',
        desc: 'Mainframe objective [💻]. Guide Agent Cipher here to complete mission.',
        tag: 'OBJECTIVE',
        tone: 'text-emerald-400',
      };
    }
    if (currentFloor.cameras?.some((c) => c.col === col && c.row === row)) {
      const cam = currentFloor.cameras.find((c) => c.col === col && c.row === row)!;
      const facing = getCameraCurrentFacing(cam, cameraTimerRef.current);
      const cycleTime = cam.cycleSeconds || 3.2;
      const timeRemaining = Math.max(0, cycleTime - (cameraTimerRef.current % cycleTime));
      return {
        title: 'Surveillance Camera',
        desc: `Optical sensor facing ${facing.toUpperCase()}. Rotates in ${timeRemaining.toFixed(1)}s. Avoid active detection beam!`,
        tag: 'CAMERA',
        tone: 'text-rose-400',
      };
    }
    if (currentFloor.doors?.some((d) => d.col === col && d.row === row)) {
      return {
        title: 'Security Door',
        desc: isDoorUnlocked
          ? 'Reinforced security door. Unlocked and clear to pass [🔓].'
          : hasKeycard
          ? 'Security door locked. Keycard acquired! Execute unlock_door() to open [🔒].'
          : 'Reinforced security door. Locked! Requires Security Keycard from B6 [🔒].',
        tag: 'DOOR',
        tone: isDoorUnlocked ? 'text-emerald-400' : 'text-amber-400',
      };
    }
    if (currentFloor.keycards?.some((k) => k.col === col && k.row === row)) {
      return {
        title: 'Security Keycard',
        desc: hasKeycard
          ? 'Security Keycard location (already collected).'
          : 'Security Keycard [💳]. Move here to acquire authorization for the Security Door.',
        tag: 'KEYCARD',
        tone: 'text-emerald-400',
      };
    }
    if (currentFloor.walls.some((w) => w.col === col && w.row === row)) {
      return {
        title: 'Reinforced Wall',
        desc: 'Impassable barrier bulkhead [🛡️ BARRIER]. Steer around this tile.',
        tag: 'BARRIER',
        tone: 'text-amber-400',
      };
    }
    if (currentFloor.lasers.some((l) => l.col === col && l.row === row)) {
      return {
        title: 'Security Laser Grid',
        desc: 'Active security beam [⚠️ DANGER LASER]. Crossing triggers alarm.',
        tag: 'HAZARD',
        tone: 'text-rose-400',
      };
    }
    if (agentRef.current.col === col && agentRef.current.row === row) {
      return {
        title: 'Agent Cipher',
        desc: 'Operative field position. Executes your Python code step-by-step.',
        tag: 'AGENT',
        tone: 'text-emerald-400',
      };
    }
    if (
      currentFloor.start.col === col &&
      currentFloor.start.row === row
    ) {
      return {
        title: 'Entry Point',
        desc: 'Initial mission infiltration spawn coordinates.',
        tag: 'ORIGIN',
        tone: 'text-blue-400',
      };
    }
    return {
      title: 'Lab Corridor',
      desc: 'Clear passable floor tile. Safe to navigate.',
      tag: 'PASSABLE',
      tone: 'text-slate-200',
    };
  }, [inspectedCell, currentFloor]);

  // Pointer inspector click on canvas
  const handleCanvasPointer = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const pad = 50;
      const cellW = (canvasWidth - pad * 2) / GRID_COLS;
      const cellH = (canvasHeight - pad * 2) / GRID_ROWS;

      if (
        px >= pad &&
        px <= canvasWidth - pad &&
        py >= pad &&
        py <= canvasHeight - pad
      ) {
        const col = Math.floor((px - pad) / cellW);
        const row = Math.floor((py - pad) / cellH);
        if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
          setInspectedCell({col, row});

          const isMechanic =
            (currentFloor.cameras?.some((c) => c.col === col && c.row === row)) ||
            (currentFloor.keycards?.some((k) => k.col === col && k.row === row)) ||
            (currentFloor.doors?.some((d) => d.col === col && d.row === row)) ||
            (currentFloor.vault && currentFloor.vault.col === col && currentFloor.vault.row === row);

          if (isMechanic && MECHANIC_INTEL_CONFIGS[currentFloor.id]) {
            setIsMechanicBriefingOpen(true);
          }
        }
      }
    },
    [canvasWidth, canvasHeight],
  );

  // Training Module Interactive State
  // Floor 1 Interactive Demo: Reorderable, customizable steps
  interface T1StepItem {
    id: number;
    dir: 'right' | 'down' | 'left' | 'up';
    count: number;
  }
  const [t1Steps, setT1Steps] = useState<T1StepItem[]>([
    {id: 1, dir: 'right', count: 3},
    {id: 2, dir: 'down', count: 3},
  ]);
  const [t1AgentPos, setT1AgentPos] = useState<GridPos>({col: 0, row: 0});
  const [t1Trail, setT1Trail] = useState<GridPos[]>([{col: 0, row: 0}]);
  const [t1ActiveStepIdx, setT1ActiveStepIdx] = useState<number | null>(null);
  const [t1Simulating, setT1Simulating] = useState(false);
  const [t1Feedback, setT1Feedback] = useState<{
    status: 'neutral' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    pedagogicalTip: string;
  }>({
    status: 'neutral',
    title: 'Ready for Test Run',
    message: 'Configure the directional commands and step counts, then press "Test Sequence Run".',
    pedagogicalTip: 'Line 1 always completes fully before Line 2 starts. Order determines your path!',
  });

  // Floor 2 Interactive Demo: Variable Assignment Sandbox
  const [t2Stride, setT2Stride] = useState<number>(3);
  const [t2Traverse, setT2Traverse] = useState<number>(2);
  const [t2AgentPos, setT2AgentPos] = useState<GridPos>({col: 0, row: 0});
  const [t2Trail, setT2Trail] = useState<GridPos[]>([{col: 0, row: 0}]);
  const [t2ActiveVar, setT2ActiveVar] = useState<'stride' | 'traverse' | null>(null);
  const [t2Simulating, setT2Simulating] = useState(false);
  const [t2Feedback, setT2Feedback] = useState<{
    status: 'neutral' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    pedagogicalTip: string;
  }>({
    status: 'neutral',
    title: 'Variables Configured',
    message: 'Configure `stride` and `traverse`, then press "Test Variable Run".',
    pedagogicalTip: 'Variables allow you to change one value and scale multiple movement commands simultaneously.',
  });

  // Floor 3 Interactive Demo: For Loops Sandbox
  const [t3Repeat, setT3Repeat] = useState<number>(3);
  const [t3AgentPos, setT3AgentPos] = useState<GridPos>({col: 0, row: 0});
  const [t3Trail, setT3Trail] = useState<GridPos[]>([{col: 0, row: 0}]);
  const [t3CurrentIter, setT3CurrentIter] = useState<number | null>(null);
  const [t3Simulating, setT3Simulating] = useState(false);
  const [t3Feedback, setT3Feedback] = useState<{
    status: 'neutral' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    pedagogicalTip: string;
  }>({
    status: 'neutral',
    title: 'Loop Ready',
    message: 'Set `repeat` count and press "Test Loop Run" to see automated repetition without duplicate lines.',
    pedagogicalTip: 'The code inside the loop executes once for each cycle in `range(repeat)`.',
  });

  // Floor 4 Interactive Demo: Conditionals Sandbox
  const [t4HasKey, setT4HasKey] = useState<boolean>(true);
  const [t4AgentPos, setT4AgentPos] = useState<GridPos>({col: 0, row: 0});
  const [t4Trail, setT4Trail] = useState<GridPos[]>([{col: 0, row: 0}]);
  const [t4BranchTaken, setT4BranchTaken] = useState<'if' | 'else' | null>(null);
  const [t4Simulating, setT4Simulating] = useState(false);
  const [t4Feedback, setT4Feedback] = useState<{
    status: 'neutral' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    pedagogicalTip: string;
  }>({
    status: 'neutral',
    title: 'Booleans & Conditionals Gate Ready',
    message: 'Toggle the has_key Boolean status between True (Acquired at B6) and False (Mission Start), then press "Test Branch Run".',
    pedagogicalTip: 'A Boolean variable has only two possible values: True or False (capitalized in Python). An if statement checks if that Boolean is True.',
  });

  // Floor 5 Interactive Demo: Synthesis Challenge Sandbox
  const [t5Cycles, setT5Cycles] = useState<number>(3);
  const [t5AgentPos, setT5AgentPos] = useState<GridPos>({col: 0, row: 0});
  const [t5Trail, setT5Trail] = useState<GridPos[]>([{col: 0, row: 0}]);
  const [t5CurrentCycle, setT5CurrentCycle] = useState<number | null>(null);
  const [t5Simulating, setT5Simulating] = useState(false);
  const [t5Feedback, setT5Feedback] = useState<{
    status: 'neutral' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    pedagogicalTip: string;
  }>({
    status: 'neutral',
    title: 'Apex Synthesis Ready',
    message: 'Combine variable cycle definitions with repeated movement steps to reach the Vault Terminal at (3,3).',
    pedagogicalTip: 'High-level programming combines variables and loops to automate complex multi-stage tasks.',
  });

  // Playground lifecycle
  usePlaygroundGameLifecycle(gameState, sdk);

  // Back key handling
  useEffect(() => {
    (window as any).canHandleBackKey = currentView !== 'home';
  }, [currentView]);

  // When selected floor changes, sync code
  useEffect(() => {
    const saved = saveData.savedCode[selectedFloorId];
    setCode(saved !== undefined ? saved : currentFloor.starterCode);
    cursorPositionRef.current = {
      start: 0,
      end: 0,
      hasUserFocused: false,
    };
    resetSimulation(currentFloor);
    setStatusFeedback({
      state: 'idle',
      title: 'Ready for Code Execution',
      body: `Facility sector loaded: ${currentFloor.title}. Ready for script execution.`,
    });
  }, [selectedFloorId, currentFloor]);

  // Reset simulation to current floor
  const resetSimulation = useCallback(
    (floor = currentFloor) => {
      setIsExecuting(false);
      setActiveExecutingLine(null);
      setErrorLineIndex(null);
      currentQueueIdxRef.current = 0;
      executionQueueRef.current = [];
      terminalDecryptedRef.current = false;
      pathHistoryRef.current = [{col: floor.start.col, row: floor.start.row}];
      const onSpawnKeycard = !!(
        (floor.keycardTile && floor.keycardTile.col === floor.start.col && floor.keycardTile.row === floor.start.row) ||
        floor.keycards?.some((k) => k.col === floor.start.col && k.row === floor.start.row)
      );
      setHasKeycard(onSpawnKeycard);
      hasKeycardRef.current = onSpawnKeycard;
      setIsDoorUnlocked(false);
      isDoorUnlockedRef.current = false;
      setIsCameraCompromised(false);
      setIsReviewingFailedCode(false);
      setCompromisedCameraTile(null);
      setIsFinalEnding(false);
      finalCelebrationTimerRef.current = 0;
      celebrationParticlesRef.current = [];
      setAgentPos({col: floor.start.col, row: floor.start.row});
      setLastExecutedCommand('reset');
      runtimeTelemetryRef.current = {
        usedVariableInMovement: false,
        executedMovementLoop: false,
        executedConditionalBranch: false,
        unlockedDoorInsideConditional: false,
        variablesUsed: [],
      };

      const cellW = (canvasWidth - 100) / GRID_COLS;
      const cellH = (canvasHeight - 100) / GRID_ROWS;
      const startX = 50 + floor.start.col * cellW + cellW / 2;
      const startY = 50 + floor.start.row * cellH + cellH / 2;

      agentRef.current = {
        col: floor.start.col,
        row: floor.start.row,
        renderX: startX,
        renderY: startY,
        angle: 0,
        targetCol: floor.start.col,
        targetRow: floor.start.row,
        isMoving: false,
        moveProgress: 0,
      };
    },
    [currentFloor, canvasWidth, canvasHeight],
  );

  // Reset simulation handler with floating 3-second confirmation toast
  const handleResetSimulation = useCallback(() => {
    gameAudio.playCrispClick();
    resetSimulation(currentFloor);
    setErrorLineIndex(null);
    setStatusFeedback({
      state: 'idle',
      title: 'Ready for Code Execution',
      body: 'Simulation reset to origin. Python code preserved. Ready for retry.',
    });
    setLiveAnnouncement(
      'Simulation reset! Agent returned to start. Python code preserved.',
    );

    // Trigger visible 3-second floating toast near Reset button
    setResetToast({id: Date.now()});
    if (resetToastTimerRef.current) {
      window.clearTimeout(resetToastTimerRef.current);
    }
    resetToastTimerRef.current = window.setTimeout(() => {
      setResetToast(null);
    }, 3000);
  }, [currentFloor, resetSimulation]);

  // Camera Detection: Mission Compromised
  const handleCameraCompromised = useCallback(
    (detectedTile: GridPos) => {
      setIsExecuting(false);
      setFailedCodeSnapshot(code);
      setIsCameraCompromised(true);
      setCompromisedCameraTile(detectedTile);
      gameAudio.playArcadeLaser();
      gameAudio.playDefeatMotif();
      handleHazardFeedback({
        floorId: currentFloor.id,
        eventType: 'camera_compromised',
        heading: 'MISSION COMPROMISED — CAMERA DETECTED',
        message: 'Agent Cipher was spotted. This mission attempt must restart.',
        affectedTile: detectedTile,
        penalizeRating: false,
        suggestion: 'Watch surveillance viewing areas and move when looking away.',
      });
      setLiveAnnouncement(
        `Mission Compromised! Surveillance camera detected Agent Cipher at ${COL_LABELS[detectedTile.col]}${ROW_LABELS[detectedTile.row]}. Attempt must restart.`,
      );
    },
    [code, currentFloor.id, handleHazardFeedback],
  );

  // Camera Detection: Restart Mission
  // Resets CURRENT FLOOR to clean initial state:
  // - Agent returns to starting tile
  // - Reset camera positions and cycle timing
  // - Reset puzzle items (keycards, doors)
  // - Reset Python editor to that floor's original starter code
  // - Reset current attempt hazard count to 0
  // - Preserves completed floors, high ratings, and unlocked progress
  // - Does NOT send player back to Floor 1, and does NOT re-show pre-mission educational lesson.
  const handleRestartMissionCompromised = useCallback(() => {
    gameAudio.playConfirmSelect();
    setIsCameraCompromised(false);
    setIsReviewingFailedCode(false);
    setCompromisedCameraTile(null);
    cameraTimerRef.current = 0;
    setHasKeycard(false);
    hasKeycardRef.current = false;
    setIsDoorUnlocked(false);
    isDoorUnlockedRef.current = false;
    setCode(currentFloor.starterCode);
    cursorPositionRef.current = {
      start: 0,
      end: 0,
      hasUserFocused: false,
    };
    setHazardPenalties(0);
    setActiveHazardTile(null);
    resetSimulation(currentFloor);
    setStatusFeedback({
      state: 'idle',
      title: 'Ready for Code Execution',
      body: 'Mission attempt restarted. Code restored to starter template. Observe camera angles before executing.',
    });
    setLiveAnnouncement(
      'Mission restarted. Agent returned to start, code reset to starter template.',
    );
  }, [currentFloor, resetSimulation]);

  const handleDismissMechanicBriefing = useCallback(() => {
    gameAudio.playCrispClick();
    setSeenMechanicIntel((prev) => {
      const next = {...prev, [selectedFloorId]: true};
      try {
        localStorage.setItem(SEEN_MECHANIC_INTEL_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
    setIsMechanicBriefingOpen(false);
  }, [selectedFloorId]);

  // Enhanced AST/Statement Interpreter (Supports Variables, For-Loops, Conditionals, and Telemetry)
  const parsePythonCode = useCallback((inputCode: string, floor?: FloorData): ParseResult => {
    const activeFloor = floor || currentFloor;
    const rawLines = inputCode.split('\n');
    interface CodeLine {
      originalIndex: number;
      indent: number;
      text: string;
    }

    const parsedLines: CodeLine[] = [];
    for (let i = 0; i < rawLines.length; i++) {
      const raw = rawLines[i];
      let indent = 0;
      for (let c = 0; c < raw.length; c++) {
        if (raw[c] === ' ') indent += 1;
        else if (raw[c] === '\t') indent += 4;
        else break;
      }
      let trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const hashIdx = trimmed.indexOf('#');
      if (hashIdx !== -1) {
        trimmed = trimmed.substring(0, hashIdx).trim();
      }
      if (!trimmed) continue;
      parsedLines.push({
        originalIndex: i,
        indent,
        text: trimmed,
      });
    }

    type ASTNode =
      | { type: 'assign'; varName: string; expr: string; lineIndex: number }
      | { type: 'move'; dir: 'right' | 'left' | 'up' | 'down'; argExpr?: string; lineIndex: number }
      | { type: 'wait'; argExpr?: string; lineIndex: number }
      | { type: 'unlock_door'; lineIndex: number }
      | { type: 'for'; loopVar: string; countExpr: string; body: ASTNode[]; lineIndex: number }
      | { type: 'if'; condExpr: string; thenBody: ASTNode[]; elseBody?: ASTNode[]; lineIndex: number };

    const commonTypos: Record<string, string> = {
      moveright: 'move_right',
      move_rite: 'move_right',
      right: 'move_right',
      moveleft: 'move_left',
      move_lft: 'move_left',
      left: 'move_left',
      moveup: 'move_up',
      up: 'move_up',
      movedown: 'move_down',
      down: 'move_down',
      unlockdoor: 'unlock_door',
      unlock: 'unlock_door',
      sleep: 'wait',
      pause: 'wait',
    };

    function parseBlock(
      startIndex: number,
      minIndent: number,
    ): {
      nodes: ASTNode[];
      nextIndex: number;
      error?: { line: number; message: string; suggestion?: string };
    } {
      let idx = startIndex;
      const nodes: ASTNode[] = [];

      while (idx < parsedLines.length) {
        const cur = parsedLines[idx];
        if (cur.indent < minIndent) {
          break;
        }

        // 1. For loop: for <var> in range(<count>):
        const forMatch = cur.text.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\s*\(\s*([^)]+)\s*\)\s*:$/);
        if (forMatch) {
          const loopVar = forMatch[1];
          const countExpr = forMatch[2].trim();
          if (idx + 1 >= parsedLines.length || parsedLines[idx + 1].indent <= cur.indent) {
            return {
              nodes: [],
              nextIndex: idx,
              error: {
                line: cur.originalIndex + 1,
                message: `IndentationError: expected an indented block after 'for' statement on Line ${cur.originalIndex + 1}.`,
                suggestion: `Indent the movement commands underneath 'for ${loopVar} in range(${countExpr}):'.`,
              },
            };
          }
          const bodyIndent = parsedLines[idx + 1].indent;
          const subResult = parseBlock(idx + 1, bodyIndent);
          if (subResult.error) return subResult;
          nodes.push({
            type: 'for',
            loopVar,
            countExpr,
            body: subResult.nodes,
            lineIndex: cur.originalIndex,
          });
          idx = subResult.nextIndex;
          continue;
        }

        // Check for missing colon on 'for'
        if (/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range/.test(cur.text) && !cur.text.endsWith(':')) {
          return {
            nodes: [],
            nextIndex: idx,
            error: {
              line: cur.originalIndex + 1,
              message: `SyntaxError on Line ${cur.originalIndex + 1}: Missing colon ':' at end of for loop.`,
              suggestion: `Add a colon at the end: ${cur.text}:`,
            },
          };
        }

        // 2. If statement: if <condition>:
        const ifMatch = cur.text.match(/^if\s+([^:]+):$/);
        if (ifMatch) {
          const condExpr = ifMatch[1].trim();
          if (idx + 1 >= parsedLines.length || parsedLines[idx + 1].indent <= cur.indent) {
            return {
              nodes: [],
              nextIndex: idx,
              error: {
                line: cur.originalIndex + 1,
                message: `IndentationError: expected an indented block after 'if' statement on Line ${cur.originalIndex + 1}.`,
                suggestion: `Indent the commands underneath 'if ${condExpr}:'.`,
              },
            };
          }
          const thenIndent = parsedLines[idx + 1].indent;
          const thenResult = parseBlock(idx + 1, thenIndent);
          if (thenResult.error) return thenResult;
          idx = thenResult.nextIndex;

          let elseBody: ASTNode[] | undefined;
          if (
            idx < parsedLines.length &&
            parsedLines[idx].indent === cur.indent &&
            parsedLines[idx].text === 'else:'
          ) {
            const elseLine = parsedLines[idx];
            if (idx + 1 >= parsedLines.length || parsedLines[idx + 1].indent <= elseLine.indent) {
              return {
                nodes: [],
                nextIndex: idx,
                error: {
                  line: elseLine.originalIndex + 1,
                  message: `IndentationError: expected an indented block after 'else' statement on Line ${elseLine.originalIndex + 1}.`,
                  suggestion: 'Indent commands underneath else:.',
                },
              };
            }
            const elseIndent = parsedLines[idx + 1].indent;
            const elseResult = parseBlock(idx + 1, elseIndent);
            if (elseResult.error) return elseResult;
            elseBody = elseResult.nodes;
            idx = elseResult.nextIndex;
          }

          nodes.push({
            type: 'if',
            condExpr,
            thenBody: thenResult.nodes,
            elseBody,
            lineIndex: cur.originalIndex,
          });
          continue;
        }

        // Check for missing colon on 'if'
        if (/^if\s+/.test(cur.text) && !cur.text.endsWith(':')) {
          return {
            nodes: [],
            nextIndex: idx,
            error: {
              line: cur.originalIndex + 1,
              message: `SyntaxError on Line ${cur.originalIndex + 1}: Missing colon ':' at end of if statement.`,
              suggestion: `Add a colon at the end: ${cur.text}:`,
            },
          };
        }

        // 3. Variable assignment: var = value
        const assignMatch = cur.text.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
        if (assignMatch) {
          const varName = assignMatch[1];
          const valStr = assignMatch[2].trim();
          if (['move_right', 'move_left', 'move_up', 'move_down', 'def', 'for', 'if', 'else'].includes(varName)) {
            return {
              nodes: [],
              nextIndex: idx,
              error: {
                line: cur.originalIndex + 1,
                message: `SyntaxError on Line ${cur.originalIndex + 1}: Cannot assign to reserved keyword '${varName}'.`,
                suggestion: 'Choose a different variable name such as stride or step.',
              },
            };
          }
          nodes.push({
            type: 'assign',
            varName,
            expr: valStr,
            lineIndex: cur.originalIndex,
          });
          idx++;
          continue;
        }

        // 4. Movement function: move_dir(arg)
        const moveMatch = cur.text.match(/^(move_right|move_left|move_up|move_down)\s*\(\s*([^)]*)\s*\)$/);
        if (moveMatch) {
          const cmd = moveMatch[1];
          const arg = moveMatch[2].trim();
          let dir: 'right' | 'left' | 'up' | 'down' = 'right';
          if (cmd === 'move_right') dir = 'right';
          else if (cmd === 'move_left') dir = 'left';
          else if (cmd === 'move_up') dir = 'up';
          else if (cmd === 'move_down') dir = 'down';

          nodes.push({
            type: 'move',
            dir,
            argExpr: arg || undefined,
            lineIndex: cur.originalIndex,
          });
          idx++;
          continue;
        }

        // 5. Wait function: wait(arg)
        const waitMatch = cur.text.match(/^wait\s*\(\s*([^)]*)\s*\)$/);
        if (waitMatch) {
          nodes.push({
            type: 'wait',
            argExpr: waitMatch[1].trim() || undefined,
            lineIndex: cur.originalIndex,
          });
          idx++;
          continue;
        }

        // 6. Unlock door function: unlock_door()
        const unlockMatch =
          cur.text.match(/^unlock_door\s*(?:\(\s*.*?\s*\))?$/) ||
          cur.text.match(/^unlock\s*(?:\(\s*.*?\s*\))?$/);
        if (unlockMatch) {
          nodes.push({
            type: 'unlock_door',
            lineIndex: cur.originalIndex,
          });
          idx++;
          continue;
        }

        // 7. Print statement: print(...)
        const printMatch = cur.text.match(/^print\s*\(\s*.*?\s*\)$/);
        if (printMatch) {
          idx++;
          continue;
        }

        // Check for missing parenthesis
        if ((cur.text.startsWith('move_') || cur.text.startsWith('move')) && !cur.text.endsWith(')')) {
          return {
            nodes: [],
            nextIndex: idx,
            error: {
              line: cur.originalIndex + 1,
              message: `SyntaxError on Line ${cur.originalIndex + 1}: We didn't recognize command on Line ${cur.originalIndex + 1}.`,
              suggestion: `Make sure parentheses () are closed, e.g. ${cur.text})`,
            },
          };
        }

        // Check common typos
        const cmdName = cur.text.split('(')[0].trim().toLowerCase();
        const typo = commonTypos[cmdName];
        if (typo) {
          return {
            nodes: [],
            nextIndex: idx,
            error: {
              line: cur.originalIndex + 1,
              message: `SyntaxError on Line ${cur.originalIndex + 1}: Unknown command '${cmdName}'.`,
              suggestion: `Did you mean ${typo}(steps)? Supported commands: move_right(n), move_down(n), move_left(n), move_up(n).`,
            },
          };
        }

        return {
          nodes: [],
          nextIndex: idx,
          error: {
            line: cur.originalIndex + 1,
            message: `SyntaxError on Line ${cur.originalIndex + 1}: Unrecognized command or statement '${cur.text}'.`,
            suggestion: 'Supported commands: move_right(n), move_down(n), move_left(n), move_up(n), variables, for-loops, and if-statements.',
          },
        };
      }

      return { nodes, nextIndex: idx };
    }

    const astResult = parseBlock(0, 0);
    const telemetry: ConceptTelemetry = {
      usedVariableInMovement: false,
      executedMovementLoop: false,
      executedConditionalBranch: false,
      variablesUsed: [],
    };

    if (astResult.error) {
      return { steps: [], telemetry, error: astResult.error };
    }

    // Evaluation & Step Generation
    const steps: CommandStep[] = [];
    const variables: Record<string, number | boolean> = {};
    let simCol = activeFloor.start.col;
    let simRow = activeFloor.start.row;
    let simHasKey = !!(
      (activeFloor.keycardTile && activeFloor.keycardTile.col === simCol && activeFloor.keycardTile.row === simRow) ||
      activeFloor.keycards?.some((k) => k.col === simCol && k.row === simRow)
    );

    const gameState: Record<string, boolean> = {
      sensor_clear: true,
      sensor_active: false,
      has_key: simHasKey,
      laser_override: true,
      security_clearance: true,
    };

    function resolveBool(ident: string): boolean | undefined {
      if (ident === 'True') return true;
      if (ident === 'False') return false;
      // Disallow spoofing: has_key is strictly governed by physical inventory state
      if (ident === 'has_key') return simHasKey;
      if (variables[ident] !== undefined) {
        return !!variables[ident];
      }
      if (gameState[ident] !== undefined) {
        return gameState[ident];
      }
      return undefined;
    }

    function evalCondition(expr: string, line: number): { value: boolean; error?: string } {
      let trimmed = expr.trim();
      if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        trimmed = trimmed.slice(1, -1).trim();
      }
      if (trimmed.startsWith('not ')) {
        const ident = trimmed.substring(4).trim();
        const val = resolveBool(ident);
        if (val === undefined) return { value: false, error: `NameError: '${ident}' is not defined on Line ${line}.` };
        return { value: !val };
      }
      const eqBoolMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(==|!=|is\s+not|is)\s*(True|False)$/);
      if (eqBoolMatch) {
        const ident = eqBoolMatch[1];
        const rawOp = eqBoolMatch[2].replace(/\s+/, ' ');
        const target = eqBoolMatch[3] === 'True';
        const val = resolveBool(ident);
        if (val === undefined) return { value: false, error: `NameError: '${ident}' is not defined on Line ${line}.` };
        const isEquals = rawOp === '==' || rawOp === 'is';
        return { value: isEquals ? val === target : val !== target };
      }
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
        const val = resolveBool(trimmed);
        if (val === undefined) return { value: false, error: `NameError: '${trimmed}' is not defined on Line ${line}.` };
        return { value: val };
      }
      const compMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(>|<|>=|<=|==|!=)\s*(\d+)$/);
      if (compMatch) {
        const ident = compMatch[1];
        const op = compMatch[2];
        const num = parseInt(compMatch[3], 10);
        const val = variables[ident];
        if (typeof val !== 'number') return { value: false, error: `NameError: '${ident}' is not a numeric variable on Line ${line}.` };
        switch (op) {
          case '>': return { value: val > num };
          case '<': return { value: val < num };
          case '>=': return { value: val >= num };
          case '<=': return { value: val <= num };
          case '==': return { value: val === num };
          case '!=': return { value: val !== num };
        }
      }
      const fallback = resolveBool(trimmed);
      if (fallback !== undefined) return { value: fallback };
      return { value: false, error: `Invalid condition expression '${trimmed}' on Line ${line}.` };
    }

    function evalAssign(varName: string, exprStr: string, line: number): { error?: string } {
      // Disallow spoofing: user assignment to has_key cannot override actual physical inventory
      if (varName === 'has_key') {
        return {};
      }
      const val = exprStr.trim();
      if (val === 'True') {
        variables[varName] = true;
        return {};
      }
      if (val === 'False') {
        variables[varName] = false;
        return {};
      }
      if (/^\d+$/.test(val)) {
        variables[varName] = parseInt(val, 10);
        return {};
      }
      if (variables[val] !== undefined) {
        variables[varName] = variables[val];
        return {};
      }
      if (gameState[val] !== undefined) {
        variables[varName] = gameState[val];
        return {};
      }
      return { error: `NameError: '${val}' is not defined on Line ${line}.` };
    }

    function evalMove(
      dir: 'right' | 'left' | 'up' | 'down',
      argExpr: string | undefined,
      lineIndex: number,
      insideLoop: boolean,
      insideCond: boolean,
    ): { error?: { line: number; message: string; suggestion?: string } } {
      let count = 1;
      let isFromVar = false;
      let varName: string | undefined;

      const trimmed = argExpr ? argExpr.trim() : '';
      if (trimmed) {
        if (/^\d+$/.test(trimmed)) {
          count = parseInt(trimmed, 10);
        } else if (variables[trimmed] !== undefined) {
          const vVal = variables[trimmed];
          if (typeof vVal !== 'number') {
            return {
              error: {
                line: lineIndex + 1,
                message: `TypeError: Variable '${trimmed}' passed to move_${dir}() is not a number.`,
                suggestion: `Assign a number to ${trimmed}, e.g. ${trimmed} = 3`,
              },
            };
          }
          count = vVal;
          isFromVar = true;
          varName = trimmed;
          telemetry.usedVariableInMovement = true;
          if (!telemetry.variablesUsed.includes(trimmed)) {
            telemetry.variablesUsed.push(trimmed);
          }
        } else {
          return {
            error: {
              line: lineIndex + 1,
              message: `NameError: Variable '${trimmed}' is not defined on Line ${lineIndex + 1}.`,
              suggestion: `Define '${trimmed} = 2' before passing it to move_${dir}(${trimmed}).`,
            },
          };
        }
      }

      if (count <= 0) {
        return {
          error: {
            line: lineIndex + 1,
            message: `Zero or negative step count (${count}) on Line ${lineIndex + 1}.`,
            suggestion: 'Parameter must be a positive integer greater than 0.',
          },
        };
      }

      if (count > 8) {
        return {
          error: {
            line: lineIndex + 1,
            message: `Step parameter ${count} exceeds grid bounds on Line ${lineIndex + 1}.`,
            suggestion: 'Grid is 8x8. Keep step counts between 1 and 8.',
          },
        };
      }

      if (insideLoop) {
        telemetry.executedMovementLoop = true;
      }
      if (insideCond) {
        telemetry.executedConditionalBranch = true;
      }

      for (let s = 1; s <= count; s++) {
        if (dir === 'right') simCol++;
        else if (dir === 'left') simCol--;
        else if (dir === 'up') simRow--;
        else if (dir === 'down') simRow++;

        const onKeycard = !!(
          (activeFloor.keycardTile && activeFloor.keycardTile.col === simCol && activeFloor.keycardTile.row === simRow) ||
          activeFloor.keycards?.some((k) => k.col === simCol && k.row === simRow)
        );

        if (onKeycard) {
          simHasKey = true;
          gameState.has_key = true;
        }

        steps.push({
          type: 'move',
          direction: dir,
          lineIndex,
          stepNum: s,
          totalInCommand: count,
          isFromVariable: isFromVar,
          isInsideLoop: insideLoop,
          isInsideConditional: insideCond,
          variableName: varName,
        });
      }

      return {};
    }

    function evalNodes(
      nodes: ASTNode[],
      insideLoop: boolean,
      insideCond: boolean,
      isKeyCondition = false,
    ): { error?: { line: number; message: string; suggestion?: string } } {
      for (const node of nodes) {
        if (node.type === 'assign') {
          // Disallow spoofing: user assignment to has_key cannot override actual physical inventory
          if (node.varName === 'has_key') {
            continue;
          }
          const res = evalAssign(node.varName, node.expr, node.lineIndex + 1);
          if (res.error) {
            return {
              error: {
                line: node.lineIndex + 1,
                message: res.error,
                suggestion: `Assign a number or defined value, e.g. ${node.varName} = 3`,
              },
            };
          }
        } else if (node.type === 'move') {
          const res = evalMove(node.dir, node.argExpr, node.lineIndex, insideLoop, insideCond);
          if (res.error) return res;
        } else if (node.type === 'wait') {
          let count = 1;
          const trimmed = node.argExpr ? node.argExpr.trim() : '';
          if (trimmed) {
            if (/^\d+$/.test(trimmed)) {
              count = parseInt(trimmed, 10);
            } else if (variables[trimmed] !== undefined && typeof variables[trimmed] === 'number') {
              count = variables[trimmed] as number;
            } else {
              return {
                error: {
                  line: node.lineIndex + 1,
                  message: `NameError: Variable '${trimmed}' is not defined on Line ${node.lineIndex + 1}.`,
                  suggestion: `Define '${trimmed} = 1' before passing to wait(${trimmed}).`,
                },
              };
            }
          }

          if (count <= 0) {
            return {
              error: {
                line: node.lineIndex + 1,
                message: `ValueError: wait() parameter must be at least 1 on Line ${node.lineIndex + 1}.`,
                suggestion: 'Use wait(1) to pause for 1 tick.',
              },
            };
          }

          if (insideLoop) {
            telemetry.executedMovementLoop = true;
          }
          if (insideCond) {
            telemetry.executedConditionalBranch = true;
          }

          for (let s = 1; s <= count; s++) {
            steps.push({
              type: 'wait',
              lineIndex: node.lineIndex,
              stepNum: s,
              totalInCommand: count,
              isInsideLoop: insideLoop,
              isInsideConditional: insideCond,
            });
          }
        } else if (node.type === 'unlock_door') {
          if (insideLoop) {
            telemetry.executedMovementLoop = true;
          }
          if (insideCond) {
            telemetry.executedConditionalBranch = true;
          }
          if (isKeyCondition) {
            telemetry.unlockedDoorInsideConditional = true;
          }

          steps.push({
            type: 'unlock_door',
            lineIndex: node.lineIndex,
            stepNum: 1,
            totalInCommand: 1,
            isInsideLoop: insideLoop,
            isInsideConditional: insideCond,
            controlledByKeyConditional: isKeyCondition,
            hasKeycardAtStep: simHasKey,
          });
        } else if (node.type === 'for') {
          const cStr = node.countExpr.trim();
          let count = 0;
          if (/^\d+$/.test(cStr)) {
            count = parseInt(cStr, 10);
          } else if (variables[cStr] !== undefined && typeof variables[cStr] === 'number') {
            count = variables[cStr] as number;
          } else if (cStr.includes(',')) {
            const parts = cStr.split(',').map((p) => p.trim());
            const start = /^\d+$/.test(parts[0]) ? parseInt(parts[0], 10) : ((variables[parts[0]] as number) || 0);
            const stop = /^\d+$/.test(parts[1]) ? parseInt(parts[1], 10) : ((variables[parts[1]] as number) || 0);
            count = Math.max(0, stop - start);
          } else {
            return {
              error: {
                line: node.lineIndex + 1,
                message: `NameError: Variable '${cStr}' in range() is not defined on Line ${node.lineIndex + 1}.`,
                suggestion: `Define '${cStr} = 4' or use a number like range(4).`,
              },
            };
          }

          if (count > 20) {
            return {
              error: {
                line: node.lineIndex + 1,
                message: `Range count ${count} too large on Line ${node.lineIndex + 1}.`,
                suggestion: 'Keep loop iterations reasonable (1 to 8).',
              },
            };
          }

          for (let i = 0; i < count; i++) {
            variables[node.loopVar] = i;
            const res = evalNodes(node.body, true, insideCond, isKeyCondition);
            if (res.error) return res;
          }
        } else if (node.type === 'if') {
          const condRes = evalCondition(node.condExpr, node.lineIndex + 1);
          if (condRes.error) {
            return {
              error: {
                line: node.lineIndex + 1,
                message: condRes.error,
                suggestion: 'Evaluate a known state like sensor_clear or has_key.',
              },
            };
          }

          const isKeyCond = /has_key/.test(node.condExpr);

          if (condRes.value) {
            const res = evalNodes(node.thenBody, insideLoop, true, isKeyCond);
            if (res.error) return res;
          } else if (node.elseBody && node.elseBody.length > 0) {
            const res = evalNodes(node.elseBody, insideLoop, true, isKeyCond);
            if (res.error) return res;
          }
        }
      }
      return {};
    }

    const evalRes = evalNodes(astResult.nodes, false, false, false);
    if (evalRes.error) {
      return { steps: [], telemetry, error: evalRes.error };
    }

    return { steps, telemetry };
  }, [currentFloor]);

  // Compute Projected Path for Grid Overlay
  const projectedPath = useMemo(() => {
    if (!showPathProjection) return [];
    const parse = parsePythonCode(code, currentFloor);
    if (parse.error || parse.steps.length === 0) return [];

    const path: GridPos[] = [
      {col: currentFloor.start.col, row: currentFloor.start.row},
    ];
    let curCol = currentFloor.start.col;
    let curRow = currentFloor.start.row;
    let hasKeyProj = hasKeycard;
    let doorUnlockedProj = isDoorUnlocked;

    for (const step of parse.steps) {
      const onKeycard =
        (currentFloor.keycardTile && currentFloor.keycardTile.col === curCol && currentFloor.keycardTile.row === curRow) ||
        currentFloor.keycards?.some((k) => k.col === curCol && k.row === curRow);
      if (onKeycard) {
        hasKeyProj = true;
      }
      if (step.type === 'unlock_door' && hasKeyProj) {
        const isAtApproachTerminal = currentFloor.doors?.length ? (curCol === 3 && curRow === 3) : true;
        if (isAtApproachTerminal) {
          doorUnlockedProj = true;
        }
      }
      if (step.type === 'wait' || step.type === 'unlock_door') {
        path.push({col: curCol, row: curRow});
        continue;
      }
      if (step.direction === 'right') curCol++;
      else if (step.direction === 'left') curCol--;
      else if (step.direction === 'up') curRow--;
      else if (step.direction === 'down') curRow++;

      path.push({col: curCol, row: curRow});

      if (
        curCol < 0 ||
        curCol >= GRID_COLS ||
        curRow < 0 ||
        curRow >= GRID_ROWS
      )
        break;
      if (
        currentFloor.walls.some(
          (w) =>
            w.col === curCol &&
            w.row === curRow &&
            !(currentFloor.doors?.some((d) => d.col === w.col && d.row === w.row)),
        )
      )
        break;
      if (currentFloor.doors?.some((d) => d.col === curCol && d.row === curRow && !doorUnlockedProj))
        break;
      if (currentFloor.lasers.some((l) => l.col === curCol && l.row === curRow))
        break;
      if (
        curCol === currentFloor.terminal.col &&
        curRow === currentFloor.terminal.row
      )
        break;
    }

    return path;
  }, [code, currentFloor, showPathProjection, parsePythonCode, hasKeycard, isDoorUnlocked]);

  // Execute Code Script
  const handleRunCode = useCallback(() => {
    gameAudio.playConfirmSelect();
    setQuickStartDismissed(true);
    setActiveHazardTile(null);
    const result = parsePythonCode(code, currentFloor);

    if (result.error) {
      gameAudio.playErrorBuzz();
      setErrorLineIndex(result.error.line - 1);
      setActiveExecutingLine(result.error.line - 1);
      handleHazardFeedback({
        floorId: currentFloor.id,
        eventType: 'syntax',
        heading: `Syntax Error — Line ${result.error.line}`,
        message: result.error.message,
        penalizeRating: false,
        suggestion:
          result.error.suggestion ||
          'Check command spelling and ensure parentheses () are closed.',
        line: result.error.line,
      });
      return;
    }

    if (result.steps.length === 0) {
      gameAudio.playErrorBuzz();
      setStatusFeedback({
        state: 'error',
        title: 'Empty Script',
        body: 'No executable movement commands found in your script.',
        suggestion:
          'Tap the touch chips above or type move_right(n) to begin.',
      });
      setLiveAnnouncement(
        'Empty script. Assign variables or add movement commands to begin.',
      );
      return;
    }

    // Save current code draft
    updateSave((prev) => ({
      ...prev,
      savedCode: {...prev.savedCode, [selectedFloorId]: code},
    }));

    resetSimulation(currentFloor);
    setErrorLineIndex(null);
    setExecutionLogs([]);
    executionQueueRef.current = result.steps;
    currentQueueIdxRef.current = 0;
    setIsExecuting(true);
    setIsStepMode(false);
    setActiveExecutingLine(result.steps[0].lineIndex);
    setStatusFeedback({
      state: 'running',
      title: 'Executing Code...',
      body: `Executing ${result.steps.length} operation${
        result.steps.length > 1 ? 's' : ''
      } at ${
        executionSpeed === 'instant' ? 'instant' : `${executionSpeed}x`
      } speed...`,
      line: result.steps[0].lineIndex + 1,
    });
    setLiveAnnouncement(
      `Execution started: running ${result.steps.length} commands...`,
    );
  }, [
    code,
    currentFloor,
    executionSpeed,
    handleHazardFeedback,
    parsePythonCode,
    resetSimulation,
    selectedFloorId,
    updateSave,
  ]);

  // Single Step Debug Mode
  const handleStepCode = useCallback(() => {
    gameAudio.playCrispClick();
    setQuickStartDismissed(true);
    setActiveHazardTile(null);
    if (!isExecuting) {
      const result = parsePythonCode(code, currentFloor);
      if (result.error) {
        gameAudio.playErrorBuzz();
        setErrorLineIndex(result.error.line - 1);
        setActiveExecutingLine(result.error.line - 1);
        handleHazardFeedback({
          floorId: currentFloor.id,
          eventType: 'syntax',
          heading: `Syntax Error — Line ${result.error.line}`,
          message: result.error.message,
          penalizeRating: false,
          suggestion:
            result.error.suggestion ||
            'Check command spelling and ensure parentheses () are closed.',
          line: result.error.line,
        });
        return;
      }
      if (result.steps.length === 0) return;

      resetSimulation(currentFloor);
      setErrorLineIndex(null);
      setExecutionLogs([]);
      runtimeTelemetryRef.current = {
        usedVariableInMovement: false,
        executedMovementLoop: false,
        executedConditionalBranch: false,
        unlockedDoorInsideConditional: false,
        variablesUsed: [],
      };
      executionQueueRef.current = result.steps;
      currentQueueIdxRef.current = 0;
      setIsExecuting(true);
      setIsStepMode(true);
      setActiveExecutingLine(result.steps[0].lineIndex);
      setStatusFeedback({
        state: 'running',
        title: 'Step Mode Active',
        body: `Advancing line-by-line. Ready for Line ${
          result.steps[0].lineIndex + 1
        }. Press Step again to advance.`,
        line: result.steps[0].lineIndex + 1,
      });
      setLiveAnnouncement(
        `Step mode activated: ready to advance ${result.steps.length} commands.`,
      );
    } else {
      setIsStepMode(true);
    }
  }, [
    isExecuting,
    code,
    currentFloor,
    handleHazardFeedback,
    parsePythonCode,
    resetSimulation,
  ]);

  // Quick Command Injection with Indentation Preservation, Default-to-End Placement & Subtle 1.5s Micro-Toast
  const insertCommand = useCallback((cmd: string) => {
    gameAudio.playCrispClick();
    const cursor = cursorPositionRef.current;
    let targetLine = 1;
    let isAtEnd = false;

    setCode((prev) => {
      let nextVal = '';
      let newCursorPos = 0;

      // 1. Default insertion position: player has NOT clicked/focused inside editor
      if (!cursor.hasUserFocused || (cursor.start === 0 && cursor.end === 0 && !cursor.hasUserFocused)) {
        isAtEnd = true;
        if (prev.length === 0) {
          nextVal = cmd;
          newCursorPos = cmd.length;
        } else if (prev.endsWith('\n')) {
          nextVal = prev + cmd;
          newCursorPos = nextVal.length;
        } else {
          nextVal = prev + '\n' + cmd;
          newCursorPos = nextVal.length;
        }
      } else {
        // 2. Active cursor position is respected
        const start = Math.max(0, Math.min(prev.length, cursor.start));
        const end = Math.max(start, Math.min(prev.length, cursor.end));

        // If text is selected (end > start), replace only that selection
        if (end > start) {
          nextVal = prev.substring(0, start) + cmd + prev.substring(end);
          newCursorPos = start + cmd.length;
        } else {
          // Point cursor: analyze current line
          const lastNewline = prev.lastIndexOf('\n', start - 1);
          const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
          const lineToCursor = prev.substring(lineStart, start);

          // Extract current indentation
          const indentMatch = lineToCursor.match(/^(\s*)/);
          const currentIndent = indentMatch ? indentMatch[1] : '';

          let insertText = '';
          if (lineToCursor.trim() === '') {
            // Cursor is on an empty indented line: preserve current indentation and insert at cursor
            insertText = cmd;
          } else {
            // Cursor is after existing non-empty code on that line:
            // prepend a newline and the same indentation level (or +4 spaces if line ends with colon)
            const codeBeforeComment = lineToCursor.replace(/#.*$/, '').trimEnd();
            const extraIndent = codeBeforeComment.endsWith(':') ? '    ' : '';
            const indentToUse = currentIndent + extraIndent;
            insertText = '\n' + indentToUse + cmd;
          }

          nextVal = prev.substring(0, start) + insertText + prev.substring(end);
          newCursorPos = start + insertText.length;
        }
        if (newCursorPos >= nextVal.length - 1) {
          isAtEnd = true;
        }
      }

      // Update cursorPositionRef synchronously so consecutive chip clicks append in sequence
      cursorPositionRef.current = {
        start: newCursorPos,
        end: newCursorPos,
        hasUserFocused: true,
      };

      const linesBefore = nextVal.substring(0, newCursorPos).split('\n');
      targetLine = linesBefore.length;

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          if (isAtEnd) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
          }
        }
      });

      return nextVal;
    });

    const toastMsg = `+ ${cmd} (line ${targetLine})`;
    setChipToast({message: toastMsg, id: Date.now()});
    if (chipToastTimeoutRef.current) {
      window.clearTimeout(chipToastTimeoutRef.current);
    }
    chipToastTimeoutRef.current = window.setTimeout(() => {
      setChipToast(null);
    }, 1500);

    setLiveAnnouncement(`Command ${cmd} inserted into editor on line ${targetLine}`);
  }, []);

  // Keyboard Navigation & Indentation Handlers for Code Editor (Tab, Shift+Tab, Enter, Escape)
  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Escape key: toggle escapeToExit so the next Tab allows navigating focus OUT of the editor
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      escapeToExitRef.current = true;
      return;
    }

    // 2. Tab key handling: Indent 4 spaces or exit focus if Escape was pressed
    if (e.key === 'Tab') {
      if (escapeToExitRef.current) {
        // Escape mode active: allow standard focus navigation to adjacent controls
        escapeToExitRef.current = false;
        return;
      }

      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      if (e.shiftKey) {
        // Shift + Tab: Remove up to 4 spaces of indentation from selected line(s)
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const nextNewline = val.indexOf('\n', end);
        const lineEnd = nextNewline === -1 ? val.length : nextNewline;

        const selectedBlock = val.substring(lineStart, lineEnd);
        const lines = selectedBlock.split('\n');

        let firstLineRemoved = 0;
        let totalRemoved = 0;

        const dedentedLines = lines.map((line, idx) => {
          const match = line.match(/^( {1,4})/);
          if (match) {
            const count = match[1].length;
            if (idx === 0) firstLineRemoved = count;
            totalRemoved += count;
            return line.substring(count);
          }
          return line;
        });

        const replacement = dedentedLines.join('\n');
        const newVal = val.substring(0, lineStart) + replacement + val.substring(lineEnd);
        setCode(newVal);

        requestAnimationFrame(() => {
          if (textareaRef.current) {
            const newStart = Math.max(lineStart, start - firstLineRemoved);
            const newEnd = Math.max(lineStart, end - totalRemoved);
            textareaRef.current.selectionStart = newStart;
            textareaRef.current.selectionEnd = newEnd;
            cursorPositionRef.current = { start: newStart, end: newEnd, hasUserFocused: true };
          }
        });
      } else {
        // Tab without Shift
        if (start !== end && val.substring(start, end).includes('\n')) {
          // Multi-line selection: indent all selected lines by 4 spaces
          const lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const nextNewline = val.indexOf('\n', end);
          const lineEnd = nextNewline === -1 ? val.length : nextNewline;

          const selectedBlock = val.substring(lineStart, lineEnd);
          const lines = selectedBlock.split('\n');
          const indentedLines = lines.map((line) => '    ' + line);
          const replacement = indentedLines.join('\n');

          const addedPerLine = 4;
          const totalAdded = lines.length * addedPerLine;
          const newVal = val.substring(0, lineStart) + replacement + val.substring(lineEnd);
          setCode(newVal);

          requestAnimationFrame(() => {
            if (textareaRef.current) {
              const newStart = start + addedPerLine;
              const newEnd = end + totalAdded;
              textareaRef.current.selectionStart = newStart;
              textareaRef.current.selectionEnd = newEnd;
              cursorPositionRef.current = { start: newStart, end: newEnd, hasUserFocused: true };
            }
          });
        } else {
          // Single line / point cursor: insert 4 spaces at cursor
          const newVal = val.substring(0, start) + '    ' + val.substring(end);
          setCode(newVal);

          requestAnimationFrame(() => {
            if (textareaRef.current) {
              const newPos = start + 4;
              textareaRef.current.selectionStart = newPos;
              textareaRef.current.selectionEnd = newPos;
              cursorPositionRef.current = { start: newPos, end: newPos, hasUserFocused: true };
            }
          });
        }
      }
      return;
    }

    // 3. Enter key handling: auto-indent and colon check
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const lastNewline = val.lastIndexOf('\n', start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLineToCursor = val.substring(lineStart, start);

      const indentMatch = currentLineToCursor.match(/^(\s*)/);
      const parentIndent = indentMatch ? indentMatch[1] : '';

      const codeBeforeComment = currentLineToCursor.replace(/#.*$/, '').trimEnd();
      const endsWithColon = codeBeforeComment.endsWith(':');

      const extraIndent = endsWithColon ? '    ' : '';
      const newIndent = parentIndent + extraIndent;
      const insertText = '\n' + newIndent;

      const newVal = val.substring(0, start) + insertText + val.substring(end);
      setCode(newVal);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const newPos = start + insertText.length;
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
          cursorPositionRef.current = { start: newPos, end: newPos, hasUserFocused: true };
        }
      });
      return;
    }

    // Any normal key resets escapeToExit flag
    if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
      escapeToExitRef.current = false;
    }
  }, []);

  // Keyboard shortcuts: Ctrl+Enter (Run), Escape (Modals/Menu), R (Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent background shortcuts when onboarding walkthrough is active
      if (isTourOpen) return;

      // Space or Enter during celebration animation immediately shows Mission Accomplished
      if (isFinalEnding && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setIsFinalEnding(false);
        setIsMissionAccomplishedOpen(true);
        return;
      }

      const target = e.target as HTMLElement | null;
      const activeEl = document.activeElement as HTMLElement | null;
      const isTyping =
        (target &&
          (target.tagName === 'TEXTAREA' ||
            target.tagName === 'INPUT' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)) ||
        (activeEl &&
          (activeEl.tagName === 'TEXTAREA' ||
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'SELECT' ||
            activeEl.isContentEditable));

      // Escape closes modals or toggles menu
      if (e.key === 'Escape') {
        if (isHintModalOpen) {
          setIsHintModalOpen(false);
          return;
        }
        if (isReviewingFailedCode) {
          setIsReviewingFailedCode(false);
          return;
        }
        if (isMechanicBriefingOpen) {
          handleDismissMechanicBriefing();
          return;
        }
        if (isMissionBriefingOpen) {
          handleDismissBriefing();
          return;
        }
        if (isGridIntelOpen) {
          setIsGridIntelOpen(false);
          return;
        }
        if (lockedDossierFloor) {
          setLockedDossierFloor(null);
          return;
        }
        if (isHowToPlayOpen) {
          setIsHowToPlayOpen(false);
          return;
        }
        if (isHintDrawerOpen) {
          setIsHintDrawerOpen(false);
          return;
        }
        if (isGameMenuOpen) {
          setIsGameMenuOpen(false);
          return;
        }
        if (currentView === 'gameplay' && !isTyping) {
          setIsGameMenuOpen(true);
          return;
        }
      }

      // Ctrl+Enter or Cmd+Enter to Run Code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (currentView === 'gameplay') {
          e.preventDefault();
          handleRunCode();
          return;
        }
      }

      // R to Reset (when not actively typing in textarea)
      if (
        (e.key === 'r' || e.key === 'R') &&
        !isTyping &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        if (currentView === 'gameplay') {
          e.preventDefault();
          handleResetSimulation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentView,
    handleRunCode,
    isGameMenuOpen,
    isHowToPlayOpen,
    isHintDrawerOpen,
    lockedDossierFloor,
    currentFloor,
    resetSimulation,
    handleResetSimulation,
    isTourOpen,
    isReviewingFailedCode,
    isMechanicBriefingOpen,
    handleDismissMechanicBriefing,
    handleDismissBriefing,
  ]);

  // Navigate to training or gameplay
  const enterMission = useCallback(
    (floorId: number, forceDirect = false) => {
      gameAudio.playConfirmSelect();
      setSelectedFloorId(floorId);
      setHazardPenalties(0);
      setActiveHazardTile(null);
      const floor = FLOORS.find((f) => f.id === floorId) || FLOORS[0];

      // Pre-mission training check:
      // If the floor has not yet been completed and not explicitly bypassed, display pre-mission lesson
      const isCompleted = saveData.completedFloors.includes(floorId);

      if (!isCompleted && !forceDirect) {
        setCurrentView('training');
      } else {
        setCurrentView('gameplay');
        setGameState((prev) => ({
          ...prev,
          status: 'PLAYING',
          level: floorId,
        }));
        resetSimulation(floor);
        setErrorLineIndex(null);
        setStatusFeedback({
          state: 'idle',
          title: 'Ready for Code Execution',
          body: `Sector ${floor.title} loaded. Ready for script execution.`,
        });
        if (sdk) sdk.startGame();
      }
    },
    [
      resetSimulation,
      sdk,
      saveData.completedFloors,
    ],
  );

  const handleReplayMission = useCallback(
    (floorId: number) => {
      enterMission(floorId, true);
    },
    [enterMission],
  );

  const spawnCelebrationParticles = useCallback(
    (targetCol: number, targetRow: number) => {
      const cellW = (canvasWidth - 100) / GRID_COLS;
      const cellH = (canvasHeight - 100) / GRID_ROWS;
      const tx = 50 + targetCol * cellW + cellW / 2;
      const ty = 50 + targetRow * cellH + cellH / 2;

      const particles: CelebrationParticle[] = [];
      const colors = ['#4EFA8B', '#FFD166', '#B497FF', '#38BDF8', '#FFFFFF'];

      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 260 + 90;
        particles.push({
          x: tx,
          y: ty,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 80,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 5 + 2.5,
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 1.2 + 1.2,
          shape: Math.random() > 0.4 ? 'spark' : 'circle',
        });
      }
      celebrationParticlesRef.current = particles;
    },
    [canvasWidth, canvasHeight],
  );

  // Complete mission handler (invoked when agent lands on terminal)
  const handleMissionSuccess = useCallback(
    (earnedPoints: number) => {
      setLiveAnnouncement(
        selectedFloorId === 5
          ? 'Mission accomplished! Apex Master Vault opened and Top Secret Python Manual secured.'
          : 'Mission accomplished! Mainframe terminal reached. Security breached.',
      );
      const nextFloorId = selectedFloorId + 1;
      const starsEarned = calculateStars(hazardPenalties);
      setCurrentAttemptStars(starsEarned);

      updateSave((prev) => {
        const nextUnlocked = [...prev.unlockedFloors];
        if (nextFloorId <= 5 && !nextUnlocked.includes(nextFloorId)) {
          nextUnlocked.push(nextFloorId);
        }
        const nextCompleted = prev.completedFloors.includes(selectedFloorId)
          ? prev.completedFloors
          : [...prev.completedFloors, selectedFloorId];

        const prevBest = prev.highScores[selectedFloorId] || 0;
        const prevRating = prev.floorRatings?.[selectedFloorId] || 0;
        const updatedRatings = {
          ...(prev.floorRatings || {}),
          [selectedFloorId]: Math.max(prevRating, starsEarned),
        };

        return {
          ...prev,
          unlockedFloors: nextUnlocked,
          completedFloors: nextCompleted,
          highScores: {
            ...prev.highScores,
            [selectedFloorId]: Math.max(prevBest, earnedPoints),
          },
          floorRatings: updatedRatings,
          ratings: updatedRatings,
        };
      });

      setGameState((prev) => ({
        ...prev,
        score: prev.score + earnedPoints,
        status: 'VICTORY',
      }));

      if (selectedFloorId === 5) {
        setIsFinalEnding(true);
        finalCelebrationTimerRef.current = 0;
        spawnCelebrationParticles(currentFloor.terminal.col, currentFloor.terminal.row);
        gameAudio.playVictoryFanfare();
        setTimeout(() => {
          gameAudio.playLevelUpStinger();
        }, 700);
      } else {
        gameAudio.playVictoryFanfare();
        setCurrentView('debrief');
      }
    },
    [hazardPenalties, selectedFloorId, updateSave, currentFloor, spawnCelebrationParticles],
  );

  // Simulation Update Loop
  const update = (deltaTime: number) => {
    if (gameStateRef.current.status !== 'PLAYING' && !isFinalEnding) return;

    pulsePhaseRef.current += deltaTime * 3;
    terminalGlowTimerRef.current += deltaTime * 4;
    cameraTimerRef.current += deltaTime;

    // Handle Floor 5 Final Celebration Animation countdown
    if (isFinalEnding) {
      finalCelebrationTimerRef.current += deltaTime;

      // Continuously spawn golden and mint shimmer particles around the Apex Vault
      if (Math.random() < 0.6) {
        const term = currentFloor.terminal;
        const cellW = (canvasWidth - 100) / GRID_COLS;
        const cellH = (canvasHeight - 100) / GRID_ROWS;
        const tx = 50 + term.col * cellW + cellW / 2;
        const ty = 50 + term.row * cellH + cellH / 2;

        celebrationParticlesRef.current.push({
          x: tx + (Math.random() - 0.5) * 60,
          y: ty + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 140,
          vy: -Math.random() * 160 - 60,
          color: Math.random() > 0.5 ? '#FFD166' : '#4EFA8B',
          size: Math.random() * 4 + 2,
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 0.9 + 0.5,
          shape: Math.random() > 0.4 ? 'spark' : 'circle',
        });
      }

      // Update active celebration particles
      for (let i = celebrationParticlesRef.current.length - 1; i >= 0; i--) {
        const p = celebrationParticlesRef.current[i];
        p.life += deltaTime;
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          celebrationParticlesRef.current.splice(i, 1);
        }
      }

      // After 2.5s victory celebration, open the Mission Accomplished modal
      if (finalCelebrationTimerRef.current >= 2.5) {
        setIsFinalEnding(false);
        setIsMissionAccomplishedOpen(true);
        gameAudio.playPowerupChime();
      }
      return;
    }

    const agent = agentRef.current;
    const cellW = (canvasWidth - 100) / GRID_COLS;
    const cellH = (canvasHeight - 100) / GRID_ROWS;

    // Check camera vision cone intersection for floors with cameras
    if (currentFloor.cameras && currentFloor.cameras.length > 0 && !isCameraCompromised) {
      for (const cam of currentFloor.cameras) {
        const facing = getCameraCurrentFacing(cam, cameraTimerRef.current);
        const visionTiles = getCameraVisionTiles(
          cam,
          facing,
          currentFloor.walls,
          currentFloor.doors,
          hasKeycardRef.current,
        );

        const inCone = visionTiles.some(
          (t) => t.col === agent.col && t.row === agent.row,
        );

        if (inCone) {
          handleCameraCompromised({col: agent.col, row: agent.row});
          return;
        }
      }
    }

    const baseStepDuration = (getConfig('stepDurationMs') as number) / 1000;
    const isInstant = executionSpeed === 'instant';
    const speedMultiplier = executionSpeed === 2 ? 2 : 1;
    const stepDuration = isInstant
      ? 0.001
      : baseStepDuration / speedMultiplier;

    if (isExecuting) {
      if (agent.isMoving) {
        if (isInstant) {
          agent.moveProgress = 1;
        } else {
          agent.moveProgress += deltaTime / stepDuration;
        }

        const startX = 50 + agent.col * cellW + cellW / 2;
        const startY = 50 + agent.row * cellH + cellH / 2;
        const targetX = 50 + agent.targetCol * cellW + cellW / 2;
        const targetY = 50 + agent.targetRow * cellH + cellH / 2;

        if (agent.moveProgress >= 1) {
          const prevC = agent.col;
          const prevR = agent.row;
          agent.moveProgress = 0;
          agent.isMoving = false;
          agent.col = agent.targetCol;
          agent.row = agent.targetRow;
          agent.renderX = targetX;
          agent.renderY = targetY;
          setAgentPos({col: agent.col, row: agent.row});

          pathHistoryRef.current.push({col: agent.col, row: agent.row});

          // Check Keycard item collection (Floor 4)
          const onKeycard =
            (currentFloor.keycardTile && currentFloor.keycardTile.col === agent.col && currentFloor.keycardTile.row === agent.row) ||
            currentFloor.keycards?.some((k) => k.col === agent.col && k.row === agent.row);
          if (onKeycard && !hasKeycardRef.current) {
            hasKeycardRef.current = true;
            setHasKeycard(true);
            gameAudio.playCoinPickup();
            setLiveAnnouncement('🔑 Keycard: Acquired (has_key = True). Move to D4 and use unlock_door() to open the security door.');
          }

          const currentStep =
            executionQueueRef.current[currentQueueIdxRef.current];

          // Track executed concept telemetry directly from runtime step execution
          if (currentStep) {
            if (currentStep.isFromVariable) {
              runtimeTelemetryRef.current.usedVariableInMovement = true;
            }
            if (currentStep.isInsideLoop) {
              runtimeTelemetryRef.current.executedMovementLoop = true;
            }
            if (currentStep.isInsideConditional) {
              runtimeTelemetryRef.current.executedConditionalBranch = true;
            }
            if (currentStep.controlledByKeyConditional) {
              runtimeTelemetryRef.current.unlockedDoorInsideConditional = true;
            }
          }

          const isWin =
            agent.col === currentFloor.terminal.col &&
            agent.row === currentFloor.terminal.row;

          // Record step into detailed execution log
          if (currentStep && currentStep.type !== 'unlock_door') {
            setExecutionLogs((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                stepNumber: currentQueueIdxRef.current + 1,
                line: currentStep ? currentStep.lineIndex + 1 : 1,
                direction: currentStep?.type === 'wait' ? 'wait' : currentStep ? currentStep.direction || 'move' : 'move',
                fromCol: prevC,
                fromRow: prevR,
                toCol: agent.col,
                toRow: agent.row,
                status: isWin ? 'terminal' : 'ok',
                desc: isWin
                  ? `Mainframe Terminal reached at ${COL_LABELS[agent.col]}${ROW_LABELS[agent.row]}!`
                  : currentStep?.type === 'wait'
                  ? `Waited 1 tick for surveillance patrol cycle at ${COL_LABELS[agent.col]}${ROW_LABELS[agent.row]}.`
                  : `Moved ${currentStep?.direction || ''} to ${COL_LABELS[agent.col]}${ROW_LABELS[agent.row]}.`,
              },
            ]);
          }

          // First independent movement checkpoint milestone (Floor 1)
          if (currentFloor.id === 1 && !hasTriedFirstMoveRef.current) {
            hasTriedFirstMoveRef.current = true;
            setHasTriedFirstMove(true);
            try {
              localStorage.setItem(FIRST_MOVE_KEY, 'true');
            } catch (e) {
              // ignore
            }
            gameAudio.playPowerupChime();
          }

          // Check Win Condition & Required Learning Concept Validation
          if (
            agent.col === currentFloor.terminal.col &&
            agent.row === currentFloor.terminal.row
          ) {
            const conceptSatisfied = isConceptSatisfied(
              currentFloor.id,
              runtimeTelemetryRef.current,
            );

            if (conceptSatisfied) {
              terminalDecryptedRef.current = true;
              setIsExecuting(false);
              setErrorLineIndex(null);
              setStatusFeedback({
                state: 'success',
                title: 'Infiltration Confirmed — Terminal Decrypted!',
                body: `Agent Cipher successfully reached the Mainframe Terminal at [${COL_LABELS[agent.col]}, ${ROW_LABELS[agent.row]}]!`,
                suggestion: 'Sector security breached. Mission clearance granted.',
              });
              const earned = Math.max(
                150,
                600 - currentQueueIdxRef.current * 20,
              );
              handleMissionSuccess(earned);
              return;
            } else {
              // Reached terminal without concept validation: friendly pedagogical guidance, no star penalties!
              setIsExecuting(false);
              terminalDecryptedRef.current = false;
              gameAudio.playPowerupChime();
              const feedback = getConceptMissingFeedback(currentFloor.id);
              setStatusFeedback({
                state: 'concept_missing',
                title: 'Almost There, Agent!',
                body: feedback.message,
                suggestion: feedback.suggestion,
              });
              setLiveAnnouncement(feedback.message);
              return;
            }
          }

          currentQueueIdxRef.current++;

          if (isStepMode) {
            setIsExecuting(false);
            if (currentQueueIdxRef.current < executionQueueRef.current.length) {
              const nextStep =
                executionQueueRef.current[currentQueueIdxRef.current];
              setActiveExecutingLine(nextStep.lineIndex);
              setStatusFeedback({
                state: 'running',
                title: 'Step Paused',
                body: `Paused at Line ${nextStep.lineIndex + 1}: ${(nextStep.direction || nextStep.type || 'step').toUpperCase()} (${nextStep.stepNum}/${nextStep.totalInCommand}). Press Step to advance.`,
                line: nextStep.lineIndex + 1,
              });
            } else {
              setActiveExecutingLine(null);
              setStatusFeedback({
                state: 'idle',
                title: 'Route Complete',
                body: `Agent stopped safely at coordinate [${COL_LABELS[agent.col]}, ${ROW_LABELS[agent.row]}], but has not reached the Mainframe Terminal yet.`,
                suggestion: `Add another movement command to continue toward the terminal at (${COL_LABELS[currentFloor.terminal.col]}, ${ROW_LABELS[currentFloor.terminal.row]}).`,
              });
              setLiveAnnouncement(
                `Execution stopped at step ${currentQueueIdxRef.current}: Agent stopped safely at coordinate ${COL_LABELS[agent.col]}${ROW_LABELS[agent.row]}, but has not reached the Mainframe Terminal.`,
              );
            }
            return;
          }
        } else {
          const t = agent.moveProgress;
          agent.renderX = startX + (targetX - startX) * t;
          agent.renderY = startY + (targetY - startY) * t;
        }
      } else {
        if (currentQueueIdxRef.current < executionQueueRef.current.length) {
          const step = executionQueueRef.current[currentQueueIdxRef.current];
          setActiveExecutingLine(step.lineIndex);

          // Handle wait command
          if (step.type === 'wait') {
            agent.isMoving = true;
            agent.targetCol = agent.col;
            agent.targetRow = agent.row;
            agent.moveProgress = 0;
            setStatusFeedback({
              state: 'running',
              title: 'Executing Code...',
              body: `Line ${step.lineIndex + 1}: wait(${step.totalInCommand}) — Pausing for surveillance cycle...`,
              line: step.lineIndex + 1,
            });
            return;
          }

          // Handle unlock_door command
          if (step.type === 'unlock_door') {
            if (step.isInsideConditional) {
              runtimeTelemetryRef.current.executedConditionalBranch = true;
            }
            if (step.controlledByKeyConditional) {
              runtimeTelemetryRef.current.unlockedDoorInsideConditional = true;
            }
            setLastExecutedCommand('unlock_door()');
            agent.isMoving = true;
            agent.targetCol = agent.col;
            agent.targetRow = agent.row;
            agent.moveProgress = 0;

            // Approach tile requirement: unlock_door() requires Agent Cipher to be directly in front of the door at D4 (col 3, row 3)
            if (currentFloor.doors && currentFloor.doors.length > 0) {
              const isAtDoorTerminal =
                (agent.col === 3 && agent.row === 3) ||
                currentFloor.doors.some(
                  (d) =>
                    Math.abs(agent.col - d.col) +
                      Math.abs(agent.row - d.row) <=
                    1,
                );
              if (!isAtDoorTerminal) {
                setIsExecuting(false);
                gameAudio.playErrorBuzz();
                setErrorLineIndex(step.lineIndex);
                handleHazardFeedback({
                  floorId: currentFloor.id,
                  eventType: 'door_terminal',
                  heading: 'ACCESS DENIED',
                  message:
                    'Access Denied: Agent Cipher must be at the door terminal (D4) to interface with the lock.',
                  affectedTile: {col: agent.col, row: agent.row},
                  penalizeRating: false,
                  suggestion:
                    'Navigate Agent Cipher to D4 directly in front of the door at E4 before calling unlock_door().',
                  line: step.lineIndex + 1,
                });
                setExecutionLogs((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    stepNumber: currentQueueIdxRef.current + 1,
                    line: step.lineIndex + 1,
                    direction: 'unlock',
                    fromCol: agent.col,
                    fromRow: agent.row,
                    toCol: agent.col,
                    toRow: agent.row,
                    status: 'wall',
                    desc: 'Access Denied: Agent Cipher must be at the door terminal (D4) to interface with the lock.',
                  },
                ]);
                return;
              }
            }

            if (hasKeycardRef.current || step.hasKeycardAtStep) {
              setIsDoorUnlocked(true);
              isDoorUnlockedRef.current = true;
              gameAudio.playConfirmSelect();
              setStatusFeedback({
                state: 'running',
                title: 'Executing Code...',
                body: 'Security Door Unlocked! Access granted.',
                line: step.lineIndex + 1,
              });
              setLiveAnnouncement('Security Door Unlocked! Access granted.');
              setExecutionLogs((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  stepNumber: currentQueueIdxRef.current + 1,
                  line: step.lineIndex + 1,
                  direction: 'unlock',
                  fromCol: agent.col,
                  fromRow: agent.row,
                  toCol: agent.col,
                  toRow: agent.row,
                  status: 'ok',
                  desc: 'Security Door Unlocked! Access granted.',
                },
              ]);
            } else {
              setIsExecuting(false);
              gameAudio.playErrorBuzz();
              setErrorLineIndex(step.lineIndex);
              handleHazardFeedback({
                floorId: currentFloor.id,
                eventType: 'door',
                heading: 'ACCESS DENIED',
                message:
                  'ACCESS DENIED — Keycard required. Find the security keycard and try again.',
                affectedTile: {col: agent.col, row: agent.row},
                penalizeRating: false,
                suggestion:
                  'Move to B6 to acquire the keycard before calling unlock_door().',
                line: step.lineIndex + 1,
              });
              setLiveAnnouncement('ACCESS DENIED — Keycard required. Find the security keycard and try again.');
              setExecutionLogs((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  stepNumber: currentQueueIdxRef.current + 1,
                  line: step.lineIndex + 1,
                  direction: 'unlock',
                  fromCol: agent.col,
                  fromRow: agent.row,
                  toCol: agent.col,
                  toRow: agent.row,
                  status: 'wall',
                  desc: 'ACCESS DENIED — Keycard required. Find the security keycard and try again.',
                },
              ]);
              return;
            }
            return;
          }

          let nextCol = agent.col;
          let nextRow = agent.row;
          let targetAngle = agent.angle;

          if (step.direction === 'right') {
            nextCol += 1;
            targetAngle = 0;
          } else if (step.direction === 'left') {
            nextCol -= 1;
            targetAngle = Math.PI;
          } else if (step.direction === 'up') {
            nextRow -= 1;
            targetAngle = -Math.PI / 2;
          } else if (step.direction === 'down') {
            nextRow += 1;
            targetAngle = Math.PI / 2;
          }

          agent.angle = targetAngle;

          // Perimeter Collision
          if (
            nextCol < 0 ||
            nextCol >= GRID_COLS ||
            nextRow < 0 ||
            nextRow >= GRID_ROWS
          ) {
            setIsExecuting(false);
            gameAudio.playErrorBuzz();
            setErrorLineIndex(step.lineIndex);
            handleHazardFeedback({
              floorId: currentFloor.id,
              eventType: 'perimeter',
              heading: `Perimeter Blocked — Line ${step.lineIndex + 1}`,
              message:
                'Agent Cipher attempted to move outside the 8x8 facility perimeter grid.',
              penalizeRating: false,
              suggestion: 'Reduce the step count so Cipher stays within the room.',
              line: step.lineIndex + 1,
            });
            setExecutionLogs((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                stepNumber: currentQueueIdxRef.current + 1,
                line: step.lineIndex + 1,
                direction: step.direction || 'move',
                fromCol: agent.col,
                fromRow: agent.row,
                toCol: nextCol,
                toRow: nextRow,
                status: 'perimeter',
                desc: 'Facility perimeter boundary reached. Path blocked.',
              },
            ]);
            return;
          }

          // Wall Collision
          const hitWall = currentFloor.walls.some(
            (w) =>
              w.col === nextCol &&
              w.row === nextRow &&
              !(currentFloor.doors?.some((d) => d.col === w.col && d.row === w.row)),
          );
          if (hitWall) {
            setIsExecuting(false);
            gameAudio.playErrorBuzz();
            setErrorLineIndex(step.lineIndex);
            const coordStr = `${COL_LABELS[nextCol]}${ROW_LABELS[nextRow]}`;
            handleHazardFeedback({
              floorId: currentFloor.id,
              eventType: 'wall',
              heading: `Movement Blocked — Line ${step.lineIndex + 1}`,
              message: `Agent Cipher encountered an obstacle at ${coordStr}. Adjust your route and try again.`,
              affectedTile: {col: nextCol, row: nextRow},
              penalizeRating: false,
              suggestion: 'Adjust your route and try again.',
              line: step.lineIndex + 1,
            });
            setExecutionLogs((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                stepNumber: currentQueueIdxRef.current + 1,
                line: step.lineIndex + 1,
                direction: step.direction || 'move',
                fromCol: agent.col,
                fromRow: agent.row,
                toCol: nextCol,
                toRow: nextRow,
                status: 'wall',
                desc: `Collision with obstacle at grid coordinate ${coordStr}. Path blocked.`,
              },
            ]);
            return;
          }

          // Locked Door Collision
          const hitDoor = currentFloor.doors?.some(
            (d) => d.col === nextCol && d.row === nextRow && !isDoorUnlockedRef.current,
          );
          if (hitDoor) {
            setIsExecuting(false);
            gameAudio.playErrorBuzz();
            setErrorLineIndex(step.lineIndex);
            const coordStr = `${COL_LABELS[nextCol]}${ROW_LABELS[nextRow]}`;
            handleHazardFeedback({
              floorId: currentFloor.id,
              eventType: 'door',
              heading: 'ACCESS DENIED',
              message: 'Keycard required. Find the security keycard and try again.',
              affectedTile: {col: nextCol, row: nextRow},
              penalizeRating: false,
              suggestion: 'Collect the keycard at B6, then evaluate `if has_key:` and call `unlock_door()`.',
              line: step.lineIndex + 1,
            });
            setExecutionLogs((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                stepNumber: currentQueueIdxRef.current + 1,
                line: step.lineIndex + 1,
                direction: step.direction || 'move',
                fromCol: agent.col,
                fromRow: agent.row,
                toCol: nextCol,
                toRow: nextRow,
                status: 'wall',
                desc: `ACCESS DENIED — Keycard required. Find the security keycard and try again. [${coordStr}]`,
              },
            ]);
            return;
          }

          // Laser Collision
          const hitLaser = currentFloor.lasers.some(
            (l) => l.col === nextCol && l.row === nextRow,
          );
          if (hitLaser) {
            setIsExecuting(false);
            gameAudio.playArcadeLaser();
            gameAudio.playDefeatMotif();
            setErrorLineIndex(step.lineIndex);
            const coordStr = `${COL_LABELS[nextCol]}${ROW_LABELS[nextRow]}`;
            handleHazardFeedback({
              floorId: currentFloor.id,
              eventType: 'laser',
              heading: 'SECURITY BREACH — LASER DETECTED',
              message:
                'Agent Cipher triggered a laser. Execution stopped. Review your route and try again.',
              affectedTile: {col: nextCol, row: nextRow},
              penalizeRating: true,
              suggestion: 'Review your route and try again.',
              line: step.lineIndex + 1,
            });
            setExecutionLogs((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                stepNumber: currentQueueIdxRef.current + 1,
                line: step.lineIndex + 1,
                direction: step.direction || 'move',
                fromCol: agent.col,
                fromRow: agent.row,
                toCol: nextCol,
                toRow: nextRow,
                status: 'laser',
                desc: `Collision with Security Laser Grid at grid coordinate ${coordStr}. Alarm triggered.`,
              },
            ]);
            return;
          }

          agent.isMoving = true;
          agent.targetCol = nextCol;
          agent.targetRow = nextRow;
          agent.moveProgress = 0;
          gameAudio.playFootstepStone();

          // Update running feedback status with active step
          setStatusFeedback({
            state: 'running',
            title: 'Executing Code...',
            body: `Executing Line ${step.lineIndex + 1}: move_${step.direction}() (${step.stepNum}/${step.totalInCommand})...`,
            line: step.lineIndex + 1,
          });
        } else {
          setIsExecuting(false);
          setActiveExecutingLine(null);
          if (
            agent.col !== currentFloor.terminal.col ||
            agent.row !== currentFloor.terminal.row
          ) {
            setStatusFeedback({
              state: 'idle',
              title: 'Route Complete',
              body: `Agent stopped safely at coordinate [${COL_LABELS[agent.col]}, ${ROW_LABELS[agent.row]}], but has not reached the Mainframe Terminal.`,
              suggestion: `Add another movement command to continue toward the terminal at (${COL_LABELS[currentFloor.terminal.col]}, ${ROW_LABELS[currentFloor.terminal.row]}).`,
            });
            setLiveAnnouncement(
              `Execution stopped at step ${currentQueueIdxRef.current}: Agent stopped safely at coordinate ${COL_LABELS[agent.col]}${ROW_LABELS[agent.row]}, but has not reached the Mainframe Terminal.`,
            );
          }
        }
      }
    }
  };

  // Canvas Drawing
  const draw = (ctx: CanvasRenderingContext2D) => {
    prepareCanvas(ctx, canvasWidth, canvasHeight);

    // 1. Dimmed background with softened contrast to eliminate tile clutter
    drawBackground(
      ctx,
      assets['lab_floor_background'],
      canvasWidth,
      canvasHeight,
      THEME.colors.bgDark,
    );

    // Soft dark wash to ensure high contrast against characters & pathways
    ctx.fillStyle = 'rgba(7, 12, 22, 0.76)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const pad = 50;
    const gridW = canvasWidth - pad * 2;
    const gridH = canvasHeight - pad * 2;
    const cellW = gridW / GRID_COLS;
    const cellH = gridH / GRID_ROWS;

    // Dark high-contrast grid surface
    ctx.save();
    ctx.fillStyle = 'rgba(11, 17, 30, 0.94)';
    ctx.fillRect(pad, pad, gridW, gridH);

    // Distinct high-contrast grid lines
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#334155'; // Crisp slate border

    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        const x = pad + c * cellW;
        const y = pad + r * cellH;
        ctx.strokeRect(x, y, cellW, cellH);

        // Grid intersection nodes
        ctx.fillStyle = 'rgba(78, 250, 139, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer perimeter reinforced border with cyber mint glow
    ctx.strokeStyle = '#4EFA8B';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pad, pad, gridW, gridH);

    // High-Contrast Coordinate Headers (Crisp White / Mint)
    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let c = 0; c < GRID_COLS; c++) {
      const x = pad + c * cellW + cellW / 2;
      // Header pill backdrop for maximum legibility
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(x - 14, pad - 28, 28, 20);
      ctx.fillRect(x - 14, canvasHeight - pad + 8, 28, 20);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 14, pad - 28, 28, 20);
      ctx.strokeRect(x - 14, canvasHeight - pad + 8, 28, 20);

      ctx.fillStyle = '#F1F5F9';
      ctx.fillText(COL_LABELS[c], x, pad - 18);
      ctx.fillText(COL_LABELS[c], x, canvasHeight - pad + 18);
    }

    for (let r = 0; r < GRID_ROWS; r++) {
      const y = pad + r * cellH + cellH / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(pad - 28, y - 10, 20, 20);
      ctx.fillRect(canvasWidth - pad + 8, y - 10, 20, 20);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad - 28, y - 10, 20, 20);
      ctx.strokeRect(canvasWidth - pad + 8, y - 10, 20, 20);

      ctx.fillStyle = '#4EFA8B';
      ctx.fillText(ROW_LABELS[r], pad - 18, y);
      ctx.fillText(ROW_LABELS[r], canvasWidth - pad + 18, y);
    }

    // Holographic Path Projection
    if (showPathProjection && projectedPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#4EFA8B';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      for (let i = 0; i < projectedPath.length; i++) {
        const p = projectedPath[i];
        const px = pad + p.col * cellW + cellW / 2;
        const py = pad + p.row * cellH + cellH / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 1; i < projectedPath.length; i++) {
        const p = projectedPath[i];
        const px = pad + p.col * cellW + cellW / 2;
        const py = pad + p.row * cellH + cellH / 2;
        const wpSize = cellW * 0.44;
        renderWaypointMarker(
          ctx,
          px,
          py,
          wpSize,
          pulsePhaseRef.current,
          i,
          assets['footprint_marker'],
        );
      }
      ctx.restore();
    }

    // Visited footprint trail with concentric mint waypoints
    for (let i = 0; i < pathHistoryRef.current.length; i++) {
      const p = pathHistoryRef.current[i];
      const px = pad + p.col * cellW + cellW / 2;
      const py = pad + p.row * cellH + cellH / 2;
      ctx.fillStyle = 'rgba(78, 250, 139, 0.5)';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Interactive Inspect Highlight Box
    if (inspectedCell) {
      const ix = pad + inspectedCell.col * cellW;
      const iy = pad + inspectedCell.row * cellH;
      ctx.save();
      ctx.strokeStyle = '#FFD166';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(ix + 2, iy + 2, cellW - 4, cellH - 4);
      ctx.setLineDash([]);

      // Corner brackets for high-tech HUD look
      const bLen = 8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ix + 2, iy + 2 + bLen);
      ctx.lineTo(ix + 2, iy + 2);
      ctx.lineTo(ix + 2 + bLen, iy + 2);
      ctx.moveTo(ix + cellW - 2, iy + cellH - 2 - bLen);
      ctx.lineTo(ix + cellW - 2, iy + cellH - 2);
      ctx.lineTo(ix + cellW - 2 - bLen, iy + cellH - 2);
      ctx.stroke();
      ctx.restore();
    }

    // Modular Wall Tiles (Sturdy slate alloy, beveled edges, steel rivets, hazard stripes, shield emblem)
    const wallMargin = 3.5;
    for (const w of currentFloor.walls) {
      const wx = pad + w.col * cellW + wallMargin;
      const wy = pad + w.row * cellH + wallMargin;
      const wSize = cellW - wallMargin * 2;
      renderSecurityWallTile(
        ctx,
        wx,
        wy,
        wSize,
        wSize,
        assets['facility_wall_tile'],
      );
    }

    // Modular Laser Barriers (Lavender/magenta emitter node, energy pylons, danger warning ⚠️)
    for (const l of currentFloor.lasers) {
      const lx = pad + l.col * cellW + wallMargin;
      const ly = pad + l.row * cellH + wallMargin;
      const lSize = cellW - wallMargin * 2;
      renderLaserBarrierTile(
        ctx,
        lx,
        ly,
        lSize,
        lSize,
        pulsePhaseRef.current,
        assets['laser_barrier_emitter'],
      );
    }

    // Modular Security Doors (Floor 4 Access Control)
    for (const d of currentFloor.doors || []) {
      const dx = pad + d.col * cellW + wallMargin;
      const dy = pad + d.row * cellH + wallMargin;
      const dSize = cellW - wallMargin * 2;
      renderSecurityDoorTile(
        ctx,
        dx,
        dy,
        dSize,
        dSize,
        isDoorUnlockedRef.current,
        pulsePhaseRef.current,
      );
    }

    // Modular Keycards (Floor 4 Access Control)
    for (const k of currentFloor.keycards || []) {
      const kx = pad + k.col * cellW + wallMargin;
      const ky = pad + k.row * cellH + wallMargin;
      const kSize = cellW - wallMargin * 2;
      renderKeycardTile(
        ctx,
        kx,
        ky,
        kSize,
        kSize,
        hasKeycardRef.current,
        pulsePhaseRef.current,
      );
    }

    // Modular Surveillance Cameras & Vision Cones (Floors 3 & 5)
    if (currentFloor.cameras && currentFloor.cameras.length > 0) {
      for (const cam of currentFloor.cameras) {
        const facing = getCameraCurrentFacing(cam, cameraTimerRef.current);
        const visionTiles = getCameraVisionTiles(
          cam,
          facing,
          currentFloor.walls,
          currentFloor.doors,
          isDoorUnlockedRef.current,
        );
        renderVisionCone(
          ctx,
          pad,
          cellW,
          cellH,
          cam,
          facing,
          visionTiles,
          isCameraCompromised,
          pulsePhaseRef.current,
        );
        const camMargin = 3.5;
        const cx = pad + cam.col * cellW + camMargin;
        const cy = pad + cam.row * cellH + camMargin;
        renderSurveillanceCamera(
          ctx,
          cx,
          cy,
          cellW - camMargin * 2,
          cellH - camMargin * 2,
          facing,
          isCameraCompromised,
          pulsePhaseRef.current,
          cameraTimerRef.current,
          cam,
        );
      }
    }

    // Localized hazard visual feedback: steady red outline / glow (ring-2 ring-rose-500/80 bg-rose-500/20)
    if (activeHazardTileRef.current) {
      const hx = pad + activeHazardTileRef.current.col * cellW;
      const hy = pad + activeHazardTileRef.current.row * cellH;
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.20)';
      ctx.fillRect(hx, hy, cellW, cellH);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.lineWidth = 3;
      ctx.strokeRect(hx + 1.5, hy + 1.5, cellW - 3, cellH - 3);
      ctx.restore();
    }

    // Modular Mainframe Terminal / Master Vault (Floor 5 Apex Vault vs Standard Mainframe)
    const term = currentFloor.terminal;
    const termMargin = 4;
    const tx = pad + term.col * cellW + termMargin;
    const ty = pad + term.row * cellH + termMargin;
    const tSize = cellW - termMargin * 2;
    if (currentFloor.vault && currentFloor.vault.col === term.col && currentFloor.vault.row === term.row) {
      renderMasterVaultTile(
        ctx,
        tx,
        ty,
        tSize,
        tSize,
        terminalDecryptedRef.current || isFinalEnding,
        terminalGlowTimerRef.current,
        isFinalEnding,
        Math.min(1, finalCelebrationTimerRef.current / 1.5),
      );
    } else {
      renderTerminalMainframeTile(
        ctx,
        tx,
        ty,
        tSize,
        tSize,
        terminalDecryptedRef.current,
        terminalGlowTimerRef.current,
        assets['terminal_mainframe'],
      );
    }

    // Celebration particles (Floor 5 Victory Sequence)
    if (celebrationParticlesRef.current.length > 0) {
      ctx.save();
      for (const p of celebrationParticlesRef.current) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'spark') {
          // Draw 4-pointed radiant spark
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 1.5);
          ctx.lineTo(p.x + p.size * 0.4, p.y);
          ctx.lineTo(p.x + p.size * 1.5, p.y);
          ctx.lineTo(p.x + p.size * 0.4, p.y);
          ctx.lineTo(p.x, p.y + p.size * 1.5);
          ctx.lineTo(p.x - p.size * 0.4, p.y);
          ctx.lineTo(p.x - p.size * 1.5, p.y);
          ctx.lineTo(p.x - p.size * 0.4, p.y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Agent Operative Cipher (Dual illuminated outer boundary ring, amber visor glow, directional beacon, drop shadow)
    const agent = agentRef.current;
    const celebrationHop = isFinalEnding ? -Math.abs(Math.sin(finalCelebrationTimerRef.current * 7)) * 10 : 0;
    renderAgentCipherOperative(
      ctx,
      agent.renderX,
      agent.renderY + celebrationHop,
      agent.angle,
      cellW,
      pulsePhaseRef.current,
      assets['agent_operative'],
      getConfig('assetAgentAspectRatio') as number,
      isFinalEnding,
      finalCelebrationTimerRef.current,
    );

    // Floor 5 Final Victory Celebration HUD Banner
    if (isFinalEnding) {
      ctx.save();
      const bannerW = Math.min(680, canvasWidth * 0.88);
      const bannerH = 60;
      const bx = (canvasWidth - bannerW) / 2;
      const by = 18;

      // Outer glow & high-contrast rounded backdrop
      ctx.shadowColor = 'rgba(255, 209, 102, 0.7)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(11, 17, 30, 0.96)';
      ctx.strokeStyle = '#FFD166';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 12);
      ctx.fill();
      ctx.stroke();

      // Inner cyan/mint hairline border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#4EFA8B';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 4, by + 4, bannerW - 8, bannerH - 8);

      // Headline
      ctx.font = 'bold 15px ui-monospace, SFMono-Regular, monospace';
      ctx.fillStyle = '#FFD166';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★ MASTER VAULT BREACHED // TOP SECRET PYTHON MANUAL SECURED! ★', canvasWidth / 2, by + 22);

      // Subtitle
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#4EFA8B';
      ctx.fillText('Classified Python directives recovered • Press Space or Enter to continue', canvasWidth / 2, by + 43);

      ctx.restore();
    }
  };

// ============================================================================
// STANDARDIZED GRID ASSET RENDERERS (Modular Tile Architecture)
// Designed for plug-and-play extension with surveillance cameras, security keycards, vault doors, etc.
// ============================================================================

/**
 * Renders a Surveillance Camera optical turret with motorized swivel chassis and scanning status LED.
 */
function renderSurveillanceCamera(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facing: 'right' | 'down' | 'left' | 'up',
  isCompromised: boolean,
  pulsePhase: number,
  cameraTimer: number,
  cam: CameraConfig,
) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const r = Math.min(width, height) * 0.38;

  const cycleTime = cam.cycleSeconds || 3.2;
  const timeInSlot = cameraTimer % cycleTime;
  const slotProgress = timeInSlot / cycleTime;
  const timeRemaining = Math.max(0, cycleTime - timeInSlot);
  const isTurning = slotProgress > 0.72;

  ctx.save();

  // Dark mounting base plate
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sweep patrol progress countdown ring around turret base
  ctx.strokeStyle = isCompromised
    ? '#EF4444'
    : isTurning
    ? '#FFD166'
    : facing === 'left'
    ? '#F43F5E'
    : '#4EFA8B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const startAng = -Math.PI / 2;
  const endAng = startAng + Math.PI * 2 * (1 - slotProgress);
  ctx.arc(cx, cy, r * 1.12, startAng, endAng);
  ctx.stroke();

  // Swivel body angle
  let angle = 0;
  if (facing === 'right') angle = 0;
  else if (facing === 'down') angle = Math.PI / 2;
  else if (facing === 'left') angle = Math.PI;
  else if (facing === 'up') angle = -Math.PI / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Optical turret barrel
  ctx.fillStyle = isCompromised ? '#991B1B' : '#1E293B';
  ctx.strokeStyle = isCompromised ? '#EF4444' : isTurning ? '#FFD166' : '#64748B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-r * 0.3, -r * 0.5, r * 1.2, r * 1.0, 4);
  ctx.fill();
  ctx.stroke();

  // Camera lens ring
  ctx.fillStyle = isCompromised
    ? '#EF4444'
    : isTurning
    ? '#FFD166'
    : facing === 'left'
    ? '#F43F5E'
    : '#4EFA8B';
  ctx.beginPath();
  ctx.arc(r * 0.8, 0, r * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Lens specular reflection
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(r * 0.75, -r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end rotate

  // Status LED
  const pulse = Math.sin(pulsePhase * 4) > 0;
  ctx.fillStyle = isCompromised
    ? '#EF4444'
    : isTurning
    ? '#FFD166'
    : facing === 'left'
    ? (pulse ? '#F43F5E' : '#991B1B')
    : '#10B981';
  ctx.beginPath();
  ctx.arc(cx - r * 0.5, cy - r * 0.5, 3, 0, Math.PI * 2);
  ctx.fill();

  // Camera label badge [📷 SCAN / TURN / AWAY + remaining seconds]
  const badgeW = width * 0.94;
  const badgeH = 15;
  const badgeX = cx - badgeW / 2;
  const badgeY = y + height - badgeH - 2;

  const statusLabel = isCompromised
    ? '🚨 ALERT!'
    : isTurning
    ? `🔄 TURN ${timeRemaining.toFixed(1)}s`
    : facing === 'left'
    ? `🔴 SCAN ${timeRemaining.toFixed(1)}s`
    : `🟢 AWAY ${timeRemaining.toFixed(1)}s`;

  ctx.fillStyle = isCompromised
    ? 'rgba(127, 29, 29, 0.95)'
    : isTurning
    ? 'rgba(120, 53, 15, 0.95)'
    : facing === 'left'
    ? 'rgba(76, 5, 25, 0.95)'
    : 'rgba(6, 78, 59, 0.95)';
  ctx.strokeStyle = isCompromised
    ? '#EF4444'
    : isTurning
    ? '#FFD166'
    : facing === 'left'
    ? '#F43F5E'
    : '#4EFA8B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isCompromised
    ? '#FCA5A5'
    : isTurning
    ? '#FFD166'
    : facing === 'left'
    ? '#FECDD3'
    : '#A7F3D0';
  ctx.font = 'bold 8px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(statusLabel, cx, badgeY + badgeH / 2);

  ctx.restore();
}

/**
 * Renders the visible vision cone beam sweeping from a surveillance camera.
 * Highlights affected tiles and outlines them with a steady red border if compromised.
 */
function renderVisionCone(
  ctx: CanvasRenderingContext2D,
  pad: number,
  cellW: number,
  cellH: number,
  cam: CameraConfig,
  facing: 'right' | 'down' | 'left' | 'up',
  visionTiles: GridPos[],
  isCompromised: boolean,
  pulsePhase: number,
) {
  if (visionTiles.length === 0) return;

  const camCenterX = pad + cam.col * cellW + cellW / 2;
  const camCenterY = pad + cam.row * cellH + cellH / 2;

  ctx.save();

  // 1. Highlight all grid tiles in the vision path
  for (const vt of visionTiles) {
    const vx = pad + vt.col * cellW;
    const vy = pad + vt.row * cellH;

    if (isCompromised) {
      // Steady red border and subtle tint (matching ring-2 ring-red-500 bg-red-950/30)
      ctx.fillStyle = 'rgba(127, 29, 29, 0.35)';
      ctx.fillRect(vx + 1, vy + 1, cellW - 2, cellH - 2);

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(vx + 1.5, vy + 1.5, cellW - 3, cellH - 3);

      // Warning crossbars on compromised tile
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vx + 4, vy + 4);
      ctx.lineTo(vx + cellW - 4, vy + cellH - 4);
      ctx.moveTo(vx + cellW - 4, vy + 4);
      ctx.lineTo(vx + 4, vy + cellH - 4);
      ctx.stroke();
    } else {
      // Normal surveillance scan: high-contrast amber/yellow glow with animated scan waves
      const wave = 0.5 + Math.sin(pulsePhase * 3) * 0.2;
      ctx.fillStyle = `rgba(255, 209, 102, ${0.16 + wave * 0.08})`;
      ctx.fillRect(vx + 1, vy + 1, cellW - 2, cellH - 2);

      ctx.strokeStyle = `rgba(255, 209, 102, ${0.45 + wave * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(vx + 2, vy + 2, cellW - 4, cellH - 4);
      ctx.setLineDash([]);
    }
  }

  // 2. Draw sweeping conical beam polygon from camera aperture to farthest tile
  const lastTile = visionTiles[visionTiles.length - 1];
  const lastCenterX = pad + lastTile.col * cellW + cellW / 2;
  const lastCenterY = pad + lastTile.row * cellH + cellH / 2;

  ctx.beginPath();
  ctx.moveTo(camCenterX, camCenterY);

  if (facing === 'right') {
    const endX = lastCenterX + cellW / 2;
    ctx.lineTo(endX, lastCenterY - cellH * 0.7);
    ctx.lineTo(endX, lastCenterY + cellH * 0.7);
  } else if (facing === 'down') {
    const endY = lastCenterY + cellH / 2;
    ctx.lineTo(lastCenterX - cellW * 0.7, endY);
    ctx.lineTo(lastCenterX + cellW * 0.7, endY);
  } else if (facing === 'left') {
    const endX = lastCenterX - cellW / 2;
    ctx.lineTo(endX, lastCenterY - cellH * 0.7);
    ctx.lineTo(endX, lastCenterY + cellH * 0.7);
  } else if (facing === 'up') {
    const endY = lastCenterY - cellH / 2;
    ctx.lineTo(lastCenterX - cellW * 0.7, endY);
    ctx.lineTo(lastCenterX + cellW * 0.7, endY);
  }
  ctx.closePath();

  if (isCompromised) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
  } else {
    const coneGrad = ctx.createRadialGradient(
      camCenterX,
      camCenterY,
      cellW * 0.3,
      camCenterX,
      camCenterY,
      cellW * (visionTiles.length + 1),
    );
    coneGrad.addColorStop(0, 'rgba(255, 209, 102, 0.35)');
    coneGrad.addColorStop(1, 'rgba(255, 209, 102, 0.05)');
    ctx.fillStyle = coneGrad;
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.6)';
    ctx.lineWidth = 1.5;
  }

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders the Security Keycard pickup item on Floor 4.
 */
function renderKeycardTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isCollected: boolean,
  pulsePhase: number,
) {
  if (isCollected) return;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const bob = Math.sin(pulsePhase * 3) * 3;

  ctx.save();

  // Floating pickup pulse glow ring
  ctx.strokeStyle = 'rgba(78, 250, 139, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + bob, width * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  // Keycard body (gold / cyber cyan)
  const cardW = width * 0.62;
  const cardH = height * 0.44;
  const cardX = cx - cardW / 2;
  const cardY = cy - cardH / 2 + bob;

  ctx.fillStyle = '#065F46'; // Deep emerald card
  ctx.strokeStyle = '#4EFA8B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 4);
  ctx.fill();
  ctx.stroke();

  // Magnetic strip
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(cardX, cardY + cardH * 0.22, cardW, cardH * 0.2);

  // Microchip
  ctx.fillStyle = '#FFD166';
  ctx.fillRect(cardX + cardW * 0.15, cardY + cardH * 0.55, cardW * 0.22, cardH * 0.28);

  // Badge label [💳 KEYCARD]
  const badgeW = width * 0.9;
  const badgeH = 14;
  const badgeX = cx - badgeW / 2;
  const badgeY = y + height - badgeH - 2;

  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.strokeStyle = '#4EFA8B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4EFA8B';
  ctx.font = 'bold 8.5px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💳 [KEYCARD]', cx, badgeY + badgeH / 2);

  ctx.restore();
}

/**
 * Renders the Reinforced Electronic Security Door on Floor 4.
 */
function renderSecurityDoorTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isUnlocked: boolean,
  pulsePhase: number,
) {
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();

  if (isUnlocked) {
    // Retracted open door frame
    ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

    // Left and right open door sliding panels
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#4EFA8B';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x + 2, y + 2, width * 0.2, height - 4);
    ctx.strokeRect(x + 2, y + 2, width * 0.2, height - 4);
    ctx.fillRect(x + width - width * 0.2 - 2, y + 2, width * 0.2, height - 4);
    ctx.strokeRect(x + width - width * 0.2 - 2, y + 2, width * 0.2, height - 4);

    // Central open passway
    ctx.strokeStyle = '#4EFA8B';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x + width * 0.25, y + 2, width * 0.5, height - 4);
    ctx.setLineDash([]);

    // Badge [🔓 UNLOCKED]
    const badgeW = width * 0.92;
    const badgeH = 14;
    const badgeX = cx - badgeW / 2;
    const badgeY = y + height - badgeH - 2;

    ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
    ctx.strokeStyle = '#4EFA8B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4EFA8B';
    ctx.font = 'bold 8.5px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔓 [UNLOCKED]', cx, badgeY + badgeH / 2);
  } else {
    // Heavy closed steel security door
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

    // Steel door panels
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
    ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);

    // Vertical lock reinforced bars
    ctx.fillStyle = '#475569';
    for (let bx = x + width * 0.25; bx <= x + width * 0.75; bx += width * 0.25) {
      ctx.fillRect(bx - 3, y + 6, 6, height - 12);
    }

    // Biometric reader lock center
    ctx.fillStyle = '#7F1D1D'; // Red lock center
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, width * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lock icon / padlock
    ctx.fillStyle = '#FCA5A5';
    ctx.beginPath();
    ctx.arc(cx, cy - 7, 5, Math.PI, 0);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillRect(cx - 5, cy - 6, 10, 8);

    // Badge [🔒 LOCKED DOOR]
    const badgeW = width * 0.92;
    const badgeH = 14;
    const badgeX = cx - badgeW / 2;
    const badgeY = y + height - badgeH - 2;

    ctx.fillStyle = 'rgba(127, 29, 29, 0.95)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FCA5A5';
    ctx.font = 'bold 8.5px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒 [LOCKED DOOR]', cx, badgeY + badgeH / 2);
  }

  ctx.restore();
}

/**
 * Renders the Supreme Master Vault & Top Secret Python Manual on Floor 5.
 */
function renderMasterVaultTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isDecrypted: boolean,
  glowTimer: number,
  isFinalEnding = false,
  celebrationProgress = 0,
) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const isOpen = isDecrypted || isFinalEnding;
  const openAmount = isFinalEnding ? Math.min(1, celebrationProgress) : (isDecrypted ? 1 : 0);

  ctx.save();

  // Expanding radial pulses of mint and amber light
  const pulseCount = isOpen ? 4 : 3;
  for (let rOffset = 1; rOffset <= pulseCount; rOffset++) {
    const pingProgress = ((glowTimer * (isOpen ? 1.2 : 0.6) + rOffset * 0.25) % 1);
    const radius = width * (0.2 + openAmount * 0.15) + pingProgress * (width * (isOpen ? 0.45 : 0.3));
    const alpha = Math.max(0, 1 - pingProgress);
    const color = (rOffset % 2 === 0) ? `rgba(78, 250, 139, ${0.85 * alpha})` : `rgba(255, 209, 102, ${0.9 * alpha})`;
    ctx.strokeStyle = color;
    ctx.lineWidth = isOpen ? 3 : 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Vault hatch base cylinder
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, width * 0.46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Internal vault chamber: deep royal indigo/black with golden floor
  ctx.fillStyle = isOpen ? '#1E1B4B' : '#0B111E';
  ctx.strokeStyle = isOpen ? '#FFD166' : '#64748B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, width * 0.40, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Vault iris hatch sliding door mechanism (opens outward as openAmount increases)
  const irisRadius = width * 0.38;
  const irisSlide = openAmount * (irisRadius * 0.65);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(glowTimer * (isOpen ? 0.8 : 0.4));

  // 6 Mechanical iris bulkheads
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(irisSlide, 0);

    ctx.fillStyle = isOpen ? '#1E293B' : '#334155';
    ctx.strokeStyle = isOpen ? '#FFD166' : '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(irisRadius * 0.2, -irisRadius * 0.25);
    ctx.lineTo(irisRadius * 0.9, -irisRadius * 0.1);
    ctx.lineTo(irisRadius * 0.8, irisRadius * 0.25);
    ctx.lineTo(irisRadius * 0.15, irisRadius * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rivet on iris leaf
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(irisRadius * 0.6, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();

  // When vault is open: Ascending vertical light beam with mint & amber energy
  if (isOpen) {
    ctx.save();
    const beamGrad = ctx.createLinearGradient(cx, cy, cx, cy - 60);
    beamGrad.addColorStop(0, 'rgba(255, 209, 102, 0.45)');
    beamGrad.addColorStop(0.5, 'rgba(78, 250, 139, 0.35)');
    beamGrad.addColorStop(1, 'rgba(78, 250, 139, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.3, cy);
    ctx.lineTo(cx - width * 0.45, cy - 60);
    ctx.lineTo(cx + width * 0.45, cy - 60);
    ctx.lineTo(cx + width * 0.3, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Floating "TOP SECRET PYTHON MANUAL" Artifact
  if (isOpen) {
    // Rises from center and floats smoothly with glowing aura
    const floatBob = Math.sin(glowTimer * 4) * 4;
    const manualY = cy - 8 + floatBob - openAmount * 16;

    ctx.save();

    // Radial amber backlight behind manual
    const glowRad = ctx.createRadialGradient(cx, manualY, 4, cx, manualY, width * 0.42);
    glowRad.addColorStop(0, 'rgba(255, 209, 102, 0.6)');
    glowRad.addColorStop(0.6, 'rgba(78, 250, 139, 0.25)');
    glowRad.addColorStop(1, 'rgba(78, 250, 139, 0)');
    ctx.fillStyle = glowRad;
    ctx.beginPath();
    ctx.arc(cx, manualY, width * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Golden Dossier Manual Cover
    const docW = width * 0.58;
    const docH = height * 0.48;
    const docX = cx - docW / 2;
    const docY = manualY - docH / 2;

    // Dossier shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(docX + 3, docY + 4, docW, docH, 5);
    ctx.fill();

    // Outer golden dossier cover
    const coverGrad = ctx.createLinearGradient(docX, docY, docX + docW, docY + docH);
    coverGrad.addColorStop(0, '#F59E0B'); // Bright amber
    coverGrad.addColorStop(0.5, '#D97706');
    coverGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = coverGrad;
    ctx.strokeStyle = '#FEF08A'; // High-contrast gold rim
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(docX, docY, docW, docH, 5);
    ctx.fill();
    ctx.stroke();

    // Inner digital dark slate display panel
    const innerMargin = 3;
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#4EFA8B'; // Mint inner circuit border
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(docX + innerMargin, docY + innerMargin, docW - innerMargin * 2, docH - innerMargin * 2, 3);
    ctx.fill();
    ctx.stroke();

    // Glowing Python Emblem & Brackets: [ { py } ]
    ctx.fillStyle = '#FFD166';
    ctx.font = 'bold 9px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TOP SECRET', cx, docY + 8);

    // Glowing Brackets
    ctx.fillStyle = '#4EFA8B';
    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, monospace';
    ctx.fillText('[ { py } ]', cx, docY + docH / 2 + 1);

    // Classified Manual Tag
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 7.5px ui-monospace, SFMono-Regular, monospace';
    ctx.fillText('PYTHON MANUAL', cx, docY + docH - 8);

    // Corner holographic brackets
    ctx.strokeStyle = '#4EFA8B';
    ctx.lineWidth = 1.5;
    const cSize = 4;
    // top-left
    ctx.beginPath();
    ctx.moveTo(docX - 2, docY + cSize);
    ctx.lineTo(docX - 2, docY - 2);
    ctx.lineTo(docX + cSize, docY - 2);
    // top-right
    ctx.moveTo(docX + docW + 2, docY + cSize);
    ctx.lineTo(docX + docW + 2, docY - 2);
    ctx.lineTo(docX + docW - cSize, docY - 2);
    // bottom-left
    ctx.moveTo(docX - 2, docY + docH - cSize);
    ctx.lineTo(docX - 2, docY + docH + 2);
    ctx.lineTo(docX + cSize, docY + docH + 2);
    // bottom-right
    ctx.moveTo(docX + docW + 2, docY + docH - cSize);
    ctx.lineTo(docX + docW + 2, docY + docH + 2);
    ctx.lineTo(docX + docW - cSize, docY + docH + 2);
    ctx.stroke();

    ctx.restore();
  } else {
    // Locked Master Vault center pad
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(cx, cy, width * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', cx, cy);
  }

  // Top Vault Badge [★ MASTER VAULT]
  const badgeW = width * 0.96;
  const badgeH = 17;
  const badgeX = cx - badgeW / 2;
  const badgeY = y - 9;

  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = isOpen ? '#4EFA8B' : '#FFD166';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isOpen ? '#4EFA8B' : '#FFD166';
  ctx.font = 'bold 9px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isOpen ? '★ [VAULT BREACHED]' : '★ [MASTER VAULT]', cx, badgeY + badgeH / 2);

  ctx.restore();
}

/**
 * Standard Security Wall: Sturdy slate alloy partition with beveled edges,
 * clean steel rivets, subtle hazard stripes, and a recognizable barrier/shield emblem.
 */
function renderSecurityWallTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  wallAsset: HTMLImageElement | null | undefined,
) {
  ctx.save();

  // Base background shadow
  ctx.fillStyle = '#070C16';
  ctx.fillRect(x, y, width, height);

  // Asset or alloy body
  drawAsset(ctx, wallAsset, x, y, width, height, (fallback) => {
    // Slate alloy metallic gradient
    const grad = fallback.createLinearGradient(x, y, x + width, y + height);
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(0.5, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    fallback.fillStyle = grad;
    fallback.fillRect(x, y, width, height);
  });

  // Beveled edge highlights
  ctx.strokeStyle = '#64748B'; // Light alloy top-left rim
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();

  ctx.strokeStyle = '#0F172A'; // Shadowed bottom-right rim
  ctx.beginPath();
  ctx.moveTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.stroke();

  // Subtle diagonal hazard stripes
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 5, y + 5, width - 10, height - 10);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.28)'; // Warm amber hazard lines
  ctx.lineWidth = 2.5;
  const stripeGap = 11;
  for (let offset = -width; offset < width * 2; offset += stripeGap) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x + offset + width, y + height);
    ctx.stroke();
  }
  ctx.restore();

  // Clean Steel Rivets at 4 corners
  const rivetOffset = 7;
  const rivets = [
    [x + rivetOffset, y + rivetOffset],
    [x + width - rivetOffset, y + rivetOffset],
    [x + rivetOffset, y + height - rivetOffset],
    [x + width - rivetOffset, y + height - rivetOffset],
  ];

  for (const [rx, ry] of rivets) {
    // Rivet dark drop shadow
    ctx.fillStyle = '#070C16';
    ctx.beginPath();
    ctx.arc(rx + 0.5, ry + 0.5, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Rivet metallic head
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Rivet specular highlight
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.arc(rx - 0.7, ry - 0.7, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner beveled reinforced border
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);

  // Outer high-contrast slate border
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Recognizable Barrier/Shield Emblem Roundel with Cross-Hatch Pattern
  const cx = x + width / 2;
  const cy = y + height / 2;
  const emblemRadius = Math.min(width, height) * 0.22;

  // Cross-hatch inner texture
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.2)';
  ctx.lineWidth = 1;
  for (let ch = -width; ch < width * 2; ch += 8) {
    ctx.beginPath();
    ctx.moveTo(x + ch, y + height);
    ctx.lineTo(x + ch + height, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = 'rgba(7, 12, 22, 0.94)';
  ctx.beginPath();
  ctx.arc(cx, cy - 4, emblemRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFD166';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, emblemRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Drawn vector security barrier shield emblem for crisp high-DPI scaling
  ctx.fillStyle = '#FFD166';
  ctx.beginPath();
  const sW = emblemRadius * 0.7;
  const sH = emblemRadius * 0.88;
  const sY = cy - 4;
  ctx.moveTo(cx, sY - sH);
  ctx.lineTo(cx + sW, sY - sH * 0.4);
  ctx.lineTo(cx + sW * 0.7, sY + sH * 0.4);
  ctx.lineTo(cx, sY + sH);
  ctx.lineTo(cx - sW * 0.7, sY + sH * 0.4);
  ctx.lineTo(cx - sW, sY - sH * 0.4);
  ctx.closePath();
  ctx.fill();

  // Inner shield detail
  ctx.fillStyle = '#070C16';
  ctx.beginPath();
  ctx.moveTo(cx, sY - sH * 0.65);
  ctx.lineTo(cx + sW * 0.65, sY - sH * 0.2);
  ctx.lineTo(cx + sW * 0.4, sY + sH * 0.3);
  ctx.lineTo(cx, sY + sH * 0.7);
  ctx.lineTo(cx - sW * 0.4, sY + sH * 0.3);
  ctx.lineTo(cx - sW * 0.65, sY - sH * 0.2);
  ctx.closePath();
  ctx.fill();

  // Distinct Barrier Label Badge [BARRIER]
  const badgeW = width * 0.86;
  const badgeH = 15;
  const badgeX = cx - badgeW / 2;
  const badgeY = y + height - badgeH - 3;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F1F5F9';
  ctx.font = 'bold 9px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🛡️ [BARRIER]', cx, badgeY + badgeH / 2);

  ctx.restore();
}

/**
 * Standard Laser Barrier: High-contrast lavender/magenta warning emitter node
 * with energy pylons and clear danger warning iconography (triangle with exclamation ⚠️).
 */
function renderLaserBarrierTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pulsePhase: number,
  laserAsset: HTMLImageElement | null | undefined,
) {
  const pulse = 0.5 + Math.sin(pulsePhase) * 0.35;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();

  // Energy field aura
  ctx.fillStyle = `rgba(180, 151, 255, ${0.15 + pulse * 0.2})`;
  ctx.fillRect(x, y, width, height);

  // Emitter asset / base
  drawAsset(ctx, laserAsset, x, y, width, height, (fallback) => {
    fallback.fillStyle = '#2E1065';
    fallback.fillRect(x, y, width, height);
  });

  // Vertical and Horizontal Energy Pylons at the edges
  const pylonSize = 6;
  ctx.fillStyle = '#7C3AED';
  ctx.strokeStyle = '#B497FF';
  ctx.lineWidth = 1.5;

  // Left & Right pylons
  ctx.fillRect(x, cy - pylonSize, pylonSize, pylonSize * 2);
  ctx.strokeRect(x, cy - pylonSize, pylonSize, pylonSize * 2);
  ctx.fillRect(x + width - pylonSize, cy - pylonSize, pylonSize, pylonSize * 2);
  ctx.strokeRect(x + width - pylonSize, cy - pylonSize, pylonSize, pylonSize * 2);

  // Top & Bottom pylons
  ctx.fillRect(cx - pylonSize, y, pylonSize * 2, pylonSize);
  ctx.strokeRect(cx - pylonSize, y, pylonSize * 2, pylonSize);
  ctx.fillRect(cx - pylonSize, y + height - pylonSize, pylonSize * 2, pylonSize);
  ctx.strokeRect(cx - pylonSize, y + height - pylonSize, pylonSize * 2, pylonSize);

  // Active high-voltage beam crossing lines with animated energy sparks
  ctx.strokeStyle = `rgba(244, 63, 94, ${0.5 + pulse * 0.4})`;
  ctx.lineWidth = 3 + pulse * 1.5;
  ctx.beginPath();
  ctx.moveTo(x + pylonSize, cy - 3);
  ctx.lineTo(x + width - pylonSize, cy - 3);
  ctx.moveTo(cx, y + pylonSize);
  ctx.lineTo(cx, y + height - pylonSize);
  ctx.stroke();

  // Energy sparks along the beam
  ctx.fillStyle = '#FFD166';
  const sparkOffsets = [-0.25, 0, 0.25];
  for (const so of sparkOffsets) {
    const sx = cx + so * width * 0.6 * Math.sin(pulsePhase * 3 + so);
    const sy = cy - 3 + Math.cos(pulsePhase * 4 + so) * 3;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Concentric electric wave ring
  ctx.strokeStyle = `rgba(180, 151, 255, ${0.4 + pulse * 0.4})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy - 3, Math.min(width, height) * (0.28 + pulse * 0.08), 0, Math.PI * 2);
  ctx.stroke();

  // Danger warning badge: Triangle with exclamation ⚠️
  const badgeRadius = Math.min(width, height) * 0.24;
  ctx.fillStyle = '#4C0519'; // Deep hazard crimson
  ctx.beginPath();
  ctx.arc(cx, cy - 4, badgeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Warning triangle icon
  const tH = badgeRadius * 0.85;
  const tW = badgeRadius * 0.9;
  const tY = cy - 4;
  ctx.fillStyle = '#FFD166';
  ctx.beginPath();
  ctx.moveTo(cx, tY - tH);
  ctx.lineTo(cx + tW, tY + tH * 0.65);
  ctx.lineTo(cx - tW, tY + tH * 0.65);
  ctx.closePath();
  ctx.fill();

  // Exclamation mark inside warning triangle
  ctx.fillStyle = '#070C16';
  ctx.fillRect(cx - 1.5, tY - tH * 0.35, 3, tH * 0.55);
  ctx.beginPath();
  ctx.arc(cx, tY + tH * 0.42, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Distinct Hazard Label Badge [DANGER LASER]
  const lBadgeW = width * 0.92;
  const lBadgeH = 15;
  const lBadgeX = cx - lBadgeW / 2;
  const lBadgeY = y + height - lBadgeH - 3;
  ctx.fillStyle = 'rgba(76, 5, 25, 0.95)';
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(lBadgeX, lBadgeY, lBadgeW, lBadgeH, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FECDD3';
  ctx.font = 'bold 8.5px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠️ [DANGER LASER]', cx, lBadgeY + lBadgeH / 2);

  // Outer high-contrast neon lavender barrier perimeter
  ctx.strokeStyle = '#B497FF';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, width, height);

  ctx.restore();
}

/**
 * Standard Mainframe Terminal: High-tech console with glowing mint circular
 * holographic ring, server chassis details, and prominent terminal screen icon.
 */
function renderTerminalMainframeTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  terminalDecrypted: boolean,
  glowTimer: number,
  terminalAsset: HTMLImageElement | null | undefined,
) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const auraPulse = 0.45 + Math.sin(glowTimer) * 0.25;

  ctx.save();

  // Glowing mint circular holographic concentric ping rings
  for (let rOffset = 1; rOffset <= 3; rOffset++) {
    const pingProgress = ((glowTimer * 0.8 + rOffset * 0.33) % 1);
    const radius = (width * 0.2) + pingProgress * (width * 0.28);
    const alpha = Math.max(0, 1 - pingProgress);
    ctx.strokeStyle = terminalDecrypted
      ? `rgba(78, 250, 139, ${0.9 * alpha})`
      : `rgba(78, 250, 139, ${0.7 * alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Base terminal server chassis
  drawAsset(ctx, terminalAsset, x, y, width, height, (fallback) => {
    // High-tech server pedestal
    fallback.fillStyle = '#064E3B';
    fallback.beginPath();
    fallback.arc(cx, cy, Math.max(0, width * 0.46), 0, Math.PI * 2);
    fallback.fill();

    // Server chassis lines
    fallback.fillStyle = '#0B111E';
    fallback.fillRect(x + width * 0.22, y + height * 0.25, width * 0.56, height * 0.5);
  });

  // Server rack vents & status LEDs
  const ledY = y + height * 0.26;
  const leds = [
    {color: '#4EFA8B', on: true},
    {color: '#38BDF8', on: true},
    {color: terminalDecrypted ? '#4EFA8B' : '#FFD166', on: Math.sin(glowTimer * 2) > 0},
  ];

  leds.forEach((led, i) => {
    ctx.fillStyle = led.on ? led.color : '#334155';
    ctx.beginPath();
    ctx.arc(x + width * 0.28 + i * 8, ledY, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Glowing holographic console boundary
  ctx.strokeStyle = '#4EFA8B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0, width * 0.42), 0, Math.PI * 2);
  ctx.stroke();

  // Prominent terminal screen icon badge ([OBJECTIVE TERMINAL] 💻)
  const badgeW = width * 0.94;
  const badgeH = 20;
  const badgeX = cx - badgeW / 2;
  const badgeY = y - 9;

  ctx.fillStyle = '#070C16';
  ctx.strokeStyle = '#4EFA8B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4EFA8B';
  ctx.font = 'bold 10px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💻 [OBJECTIVE TERMINAL]', cx, badgeY + badgeH / 2);

  ctx.restore();
}

/**
 * Standard Movement Waypoint: Clean concentric mint dot and ring markers
 * with pulsing opacity indicating traversal direction.
 */
function renderWaypointMarker(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  size: number,
  pulsePhase: number,
  index: number,
  waypointAsset: HTMLImageElement | null | undefined,
) {
  const wave = 0.5 + Math.sin(pulsePhase + index * 0.6) * 0.35;

  ctx.save();

  // Subtle outer pulse ring
  ctx.strokeStyle = `rgba(78, 250, 139, ${0.4 * wave})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, (size * 0.45) * (0.85 + wave * 0.25), 0, Math.PI * 2);
  ctx.stroke();

  // Middle ring
  ctx.strokeStyle = `rgba(78, 250, 139, ${0.8 * wave})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, size * 0.28, 0, Math.PI * 2);
  ctx.stroke();

  // Center solid beacon dot
  ctx.fillStyle = '#4EFA8B';
  ctx.beginPath();
  ctx.arc(px, py, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Standard Agent Cipher Operative:
 * - High-contrast illuminated outer boundary ring (dual-layer cyan/mint + amber)
 * - Distinct amber-yellow visor glow
 * - Sleek forward directional beacon/pointer integrated seamlessly into the agent silhouette
 * - Diffused drop shadow for unmistakable contrast against all tiles
 * - No crude floating text label required!
 */
function renderAgentCipherOperative(
  ctx: CanvasRenderingContext2D,
  renderX: number,
  renderY: number,
  angle: number,
  cellSize: number,
  pulsePhase: number,
  agentAsset: HTMLImageElement | null | undefined,
  agentAspectRatio: number,
  isFinalEnding = false,
  celebrationTimer = 0,
) {
  ctx.save();
  ctx.translate(renderX, renderY);

  const agentSize = cellSize * 0.84;
  const pulseFactor = 1 + Math.sin(pulsePhase * 2) * 0.05;

  // Celebratory victory pulse rings around Agent Cipher
  if (isFinalEnding) {
    for (let vo = 1; vo <= 3; vo++) {
      const vProgress = (celebrationTimer * 2.2 + vo * 0.33) % 1;
      const vRadius = agentSize * (0.55 + vProgress * 0.5);
      const vAlpha = Math.max(0, 1 - vProgress);
      ctx.strokeStyle = (vo % 2 === 0) ? `rgba(78, 250, 139, ${0.9 * vAlpha})` : `rgba(255, 209, 102, ${0.95 * vAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, vRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 1. Diffused drop shadow for unmistakable contrast against any tile
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.beginPath();
  ctx.ellipse(
    0,
    agentSize * 0.42,
    agentSize * 0.48,
    agentSize * 0.24,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // 2. High-contrast illuminated outer boundary ring
  ctx.save();
  // Outer glowing pulse ring
  ctx.strokeStyle = isFinalEnding ? '#4EFA8B' : 'rgba(78, 250, 139, 0.75)';
  ctx.lineWidth = isFinalEnding ? 4 : 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, (agentSize * 0.5) * pulseFactor, 0, Math.PI * 2);
  ctx.stroke();

  // Inner high-contrast bright amber-yellow border ring
  ctx.strokeStyle = '#FFD166';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, agentSize * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle tactical coordinate cross-ticks on halo
  ctx.strokeStyle = '#4EFA8B';
  ctx.lineWidth = 1.5;
  const tickR1 = agentSize * 0.42;
  const tickR2 = agentSize * 0.48;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * tickR1, Math.sin(a) * tickR1);
    ctx.lineTo(Math.cos(a) * tickR2, Math.sin(a) * tickR2);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Directional Pointer & Agent Body (Rotated toward movement orientation)
  ctx.save();
  ctx.rotate(angle);

  // Sleek Forward Directional Vision Cone
  const coneGrad = ctx.createRadialGradient(
    0,
    0,
    agentSize * 0.25,
    agentSize * 0.7,
    0,
    agentSize * 0.85,
  );
  coneGrad.addColorStop(0, 'rgba(78, 250, 139, 0.45)');
  coneGrad.addColorStop(1, 'rgba(78, 250, 139, 0)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(agentSize * 0.28, 0);
  ctx.lineTo(agentSize * 0.84, -agentSize * 0.35);
  ctx.lineTo(agentSize * 0.84, agentSize * 0.35);
  ctx.closePath();
  ctx.fill();

  // Sleek forward directional beacon pointer wedge (integrated seamlessly)
  ctx.fillStyle = '#FFD166';
  ctx.strokeStyle = '#070C16';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(agentSize * 0.56, 0);
  ctx.lineTo(agentSize * 0.38, -agentSize * 0.16);
  ctx.lineTo(agentSize * 0.42, 0);
  ctx.lineTo(agentSize * 0.38, agentSize * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Directional beacon tip glow
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(agentSize * 0.54, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  // Agent Operative Body / Asset
  const agentImgW = agentSize;
  const agentImgH = agentImgW / (agentAspectRatio || 1.51866);

  drawAsset(
    ctx,
    agentAsset,
    -agentImgW / 2,
    -agentImgH / 2,
    agentImgW,
    agentImgH,
    (fallback) => {
      // Tactical silhouette fallback
      fallback.fillStyle = '#0F172A';
      fallback.beginPath();
      fallback.ellipse(
        0,
        0,
        Math.max(0, agentImgW * 0.45),
        Math.max(0, agentImgH * 0.45),
        0,
        0,
        Math.PI * 2,
      );
      fallback.fill();

      // Armor shoulder accents
      fallback.fillStyle = '#1E293B';
      fallback.fillRect(-agentImgW * 0.3, -agentImgH * 0.4, agentImgW * 0.6, agentImgH * 0.8);
    },
  );

  // Distinct amber-yellow visor glow on agent front profile
  ctx.save();
  const visorX = agentImgW * 0.16;
  const visorY = 0;
  const visorW = 8;
  const visorH = 14;

  // Visor ambient glow
  ctx.fillStyle = 'rgba(255, 209, 102, 0.5)';
  ctx.beginPath();
  ctx.ellipse(visorX, visorY, visorW * 1.4, visorH * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Visor sharp core
  ctx.fillStyle = '#FFD166';
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(visorX - visorW / 2, visorY - visorH / 2, visorW, visorH, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end rotate

  ctx.restore(); // end agent translate
}

  // Game Loop
  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      if (inputRef.current) {
        const cancelPressed = inputRef.current.actions.cancel;
        if (cancelPressed && !lastCancelRef.current) {
          if (currentView === 'gameplay') {
            setIsGameMenuOpen((prev) => !prev);
          } else if (currentView === 'home') {
            void exitChat({});
          }
        }
        lastCancelRef.current = cancelPressed;
      }

      if (currentView === 'gameplay' && !isGameMenuOpen) {
        stepperRef.current?.(time, (dt) => updateRef.current(dt));
      }

      if (currentView === 'gameplay') {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) drawRef.current(ctx);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [currentView, isGameMenuOpen, exitChat]);

  const isMusicPlaying = !isMusicMuted;

  // Highest unlocked floor calculator
  const highestUnlockedFloor = useMemo(() => {
    return Math.max(...saveData.unlockedFloors, 1);
  }, [saveData.unlockedFloors]);

  // Floor 1 Interactive Sandbox step management & execution
  const addT1Step = () => {
    if (t1Steps.length >= 4) return;
    gameAudio.playCrispClick();
    setT1Steps((prev) => [
      ...prev,
      {id: Date.now(), dir: 'right', count: 1},
    ]);
  };

  const removeT1Step = (idx: number) => {
    if (t1Steps.length <= 1) return;
    gameAudio.playCrispClick();
    setT1Steps((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveT1StepOrder = (idx: number, direction: 'up' | 'down') => {
    gameAudio.playCrispClick();
    setT1Steps((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
    setT1Feedback({
      status: 'warning',
      title: 'Command Order Changed!',
      message: 'The lines will now execute in this new top-to-bottom sequence.',
      pedagogicalTip:
        'Command Sequencing: Line 1 always finishes before Line 2 starts. Swapping the lines changes which corner the agent visits first!',
    });
  };

  const runT1Simulation = () => {
    if (t1Simulating) return;
    gameAudio.playConfirmSelect();
    setT1Simulating(true);
    setT1ActiveStepIdx(0);

    // Build the frame-by-frame plan
    interface TrajectoryNode {
      col: number;
      row: number;
      stepIdx: number;
      outOfBounds: boolean;
      failedDir?: string;
      failedCount?: number;
    }

    const trajectory: TrajectoryNode[] = [{col: 0, row: 0, stepIdx: 0, outOfBounds: false}];
    let currentC = 0;
    let currentR = 0;
    let hitOutOfBounds = false;
    let breachedStep = -1;
    let breachInfo = {dir: '', count: 0};

    for (let sIdx = 0; sIdx < t1Steps.length; sIdx++) {
      const item = t1Steps[sIdx];
      for (let c = 0; c < item.count; c++) {
        let nextC = currentC;
        let nextR = currentR;

        if (item.dir === 'right') nextC += 1;
        if (item.dir === 'left') nextC -= 1;
        if (item.dir === 'down') nextR += 1;
        if (item.dir === 'up') nextR -= 1;

        if (nextC < 0 || nextC > 3 || nextR < 0 || nextR > 3) {
          hitOutOfBounds = true;
          breachedStep = sIdx;
          breachInfo = {dir: item.dir, count: item.count};
          trajectory.push({
            col: Math.max(0, Math.min(3, nextC)),
            row: Math.max(0, Math.min(3, nextR)),
            stepIdx: sIdx,
            outOfBounds: true,
            failedDir: item.dir,
            failedCount: item.count,
          });
          break;
        } else {
          currentC = nextC;
          currentR = nextR;
          trajectory.push({
            col: currentC,
            row: currentR,
            stepIdx: sIdx,
            outOfBounds: false,
          });
        }
      }
      if (hitOutOfBounds) break;
    }

    // Reset initial visual state
    setT1AgentPos({col: 0, row: 0});
    setT1Trail([{col: 0, row: 0}]);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      if (frame < trajectory.length) {
        const node = trajectory[frame];
        setT1AgentPos({col: node.col, row: node.row});
        setT1Trail((prev) => [...prev, {col: node.col, row: node.row}]);
        setT1ActiveStepIdx(node.stepIdx);
        gameAudio.playFootstepStone();
      } else {
        clearInterval(interval);
        setT1Simulating(false);
        setT1ActiveStepIdx(null);

        const finalNode = trajectory[trajectory.length - 1];

        if (finalNode.outOfBounds) {
          gameAudio.playErrorBuzz();
          setT1Feedback({
            status: 'error',
            title: 'Out of Bounds!',
            message: `Out of Bounds: Moving ${breachInfo.count} steps with move_${breachInfo.dir}() exceeded the 4x4 practice grid boundary.`,
            pedagogicalTip:
              'Adjust the number inside the parentheses! Each step moves exactly 1 cell in the chosen direction.',
          });
        } else if (finalNode.col === 3 && finalNode.row === 3) {
          gameAudio.playVictoryFanfare();
          setT1Feedback({
            status: 'success',
            title: 'Target Reached!',
            message: `Target Reached! Sequence executed line 1, then line 2 in exact top-to-bottom order.`,
            pedagogicalTip:
              'Mastered: Each line of code executes sequentially. Your agent is ready for the live infiltration!',
          });
        } else {
          gameAudio.playErrorBuzz();
          const targetDistCol = 3 - finalNode.col;
          const targetDistRow = 3 - finalNode.row;
          setT1Feedback({
            status: 'warning',
            title: 'Off Target',
            message: `Off Target: Agent stopped at cell [Col ${finalNode.col}, Row ${finalNode.row}]. Notice how the commands stopped before reaching Terminal [Col 3, Row 3].`,
            pedagogicalTip: `To reach the bottom-right terminal, you need ${targetDistCol > 0 ? `${targetDistCol} more right steps` : ''} ${targetDistRow > 0 ? `and ${targetDistRow} more down steps` : ''}. Modify the step numbers!`,
          });
        }
      }
    }, 280);
  };

  // Floor 2 Variable Traversal Simulation
  const runT2Simulation = () => {
    if (t2Simulating) return;
    gameAudio.playConfirmSelect();
    setT2Simulating(true);
    setT2AgentPos({col: 0, row: 0});
    setT2Trail([{col: 0, row: 0}]);

    const trajectory: {col: number; row: number; activeVar: 'stride' | 'traverse'}[] = [];
    let curC = 0;
    let curR = 0;

    for (let i = 0; i < t2Stride; i++) {
      curR = Math.min(3, curR + 1);
      trajectory.push({col: curC, row: curR, activeVar: 'stride'});
    }
    for (let i = 0; i < t2Traverse; i++) {
      curC = Math.min(3, curC + 1);
      trajectory.push({col: curC, row: curR, activeVar: 'traverse'});
    }

    let frame = 0;
    const interval = setInterval(() => {
      if (frame < trajectory.length) {
        const node = trajectory[frame];
        setT2AgentPos({col: node.col, row: node.row});
        setT2Trail((prev) => [...prev, {col: node.col, row: node.row}]);
        setT2ActiveVar(node.activeVar);
        gameAudio.playFootstepStone();
        frame++;
      } else {
        clearInterval(interval);
        setT2Simulating(false);
        setT2ActiveVar(null);
        const finalNode = trajectory[trajectory.length - 1] || {col: 0, row: 0};
        const isGoal = finalNode.col === 3 && finalNode.row === 3;
        if (isGoal) {
          gameAudio.playVictoryFanfare();
          setT2Feedback({
            status: 'success',
            title: 'Variable Target Reached!',
            message: `Target reached! Python substituted stride=${t2Stride} and traverse=${t2Traverse} directly into the movement calls.`,
            pedagogicalTip: 'Notice how cleanly variables replace hardcoded numbers. Changing the variable scales every referenced command!',
          });
        } else {
          gameAudio.playConfirmSelect();
          setT2Feedback({
            status: 'neutral',
            title: `Execution Complete [Col ${finalNode.col}, Row ${finalNode.row}]`,
            message: `Agent moved down ${t2Stride} steps using 'stride', then right ${t2Traverse} steps using 'traverse'.`,
            pedagogicalTip: `Set stride=3 and traverse=3 to reach the bottom-right terminal at (3,3)!`,
          });
        }
      }
    }, 280);
  };

  // Floor 3 For Loop Iteration Simulation
  const runT3Simulation = () => {
    if (t3Simulating) return;
    gameAudio.playConfirmSelect();
    setT3Simulating(true);
    setT3AgentPos({col: 0, row: 0});
    setT3Trail([{col: 0, row: 0}]);
    setT3CurrentIter(null);

    const trajectory: {col: number; row: number; iter: number}[] = [];
    let curC = 0;
    for (let i = 0; i < t3Repeat; i++) {
      curC = Math.min(3, curC + 1);
      trajectory.push({col: curC, row: 0, iter: i + 1});
    }

    let frame = 0;
    const interval = setInterval(() => {
      if (frame < trajectory.length) {
        const node = trajectory[frame];
        setT3AgentPos({col: node.col, row: node.row});
        setT3Trail((prev) => [...prev, {col: node.col, row: node.row}]);
        setT3CurrentIter(node.iter);
        gameAudio.playFootstepStone();
        frame++;
      } else {
        clearInterval(interval);
        setT3Simulating(false);
        const reachedTarget = t3Repeat === 3;
        if (reachedTarget) {
          gameAudio.playVictoryFanfare();
          setT3Feedback({
            status: 'success',
            title: 'Loop Target Reached!',
            message: `The loop executed move_right(1) exactly ${t3Repeat} times without needing ${t3Repeat} separate lines of code!`,
            pedagogicalTip: 'Loops eliminate repetitive code lines. Changing `repeat` automatically controls total execution cycles.',
          });
        } else {
          gameAudio.playConfirmSelect();
          setT3Feedback({
            status: 'neutral',
            title: `Loop Completed ${t3Repeat} Cycles`,
            message: `Agent traversed ${t3Repeat} tiles East. Terminal is located at Col 3.`,
            pedagogicalTip: 'Set repeat = 3 to land exactly on the terminal!',
          });
        }
      }
    }, 300);
  };

  // Floor 4 Conditional Branch Simulation
  const runT4Simulation = () => {
    if (t4Simulating) return;
    gameAudio.playConfirmSelect();
    setT4Simulating(true);
    setT4AgentPos({col: 0, row: 0});
    setT4Trail([{col: 0, row: 0}]);
    setT4BranchTaken(null);

    if (t4HasKey) {
      setT4BranchTaken('if');
      const trajectory = [
        {col: 1, row: 0},
        {col: 2, row: 0},
        {col: 3, row: 0},
      ];
      let frame = 0;
      const interval = setInterval(() => {
        if (frame < trajectory.length) {
          const node = trajectory[frame];
          setT4AgentPos({col: node.col, row: node.row});
          setT4Trail((prev) => [...prev, {col: node.col, row: node.row}]);
          gameAudio.playFootstepStone();
          frame++;
        } else {
          clearInterval(interval);
          setT4Simulating(false);
          gameAudio.playVictoryFanfare();
          setT4Feedback({
            status: 'success',
            title: 'Boolean True — if Block Executed & Door Unlocked!',
            message: 'has_key evaluated to True. The indented block under `if has_key:` ran unlock_door(), opening the electronic bulkhead and allowing Agent Cipher to reach the terminal!',
            pedagogicalTip: 'Booleans have only two values: True and False. When True, the `if` block executes. Note the colon (:) and 4-space indentation!',
          });
        }
      }, 280);
    } else {
      setT4BranchTaken('else');
      const trajectory = [
        {col: 1, row: 0},
      ];
      let frame = 0;
      const interval = setInterval(() => {
        if (frame < trajectory.length) {
          const node = trajectory[frame];
          setT4AgentPos({col: node.col, row: node.row});
          setT4Trail((prev) => [...prev, {col: node.col, row: node.row}]);
          gameAudio.playFootstepStone();
          frame++;
        } else {
          clearInterval(interval);
          setT4Simulating(false);
          gameAudio.playErrorBuzz();
          setT4Feedback({
            status: 'warning',
            title: 'Boolean False — else Branch Executed!',
            message: 'has_key evaluated to False, so Python skipped the `if` block and ran the `else:` branch: print("Find the keycard first."). The door at (2,0) remains locked!',
            pedagogicalTip: 'At mission start has_key is False. Agent Cipher must physically move to B6 first to update has_key to True before approaching the door!',
          });
        }
      }, 280);
    }
  };

  // Floor 5 Combined Synthesis Simulation
  const runT5Simulation = () => {
    if (t5Simulating) return;
    gameAudio.playConfirmSelect();
    setT5Simulating(true);
    setT5AgentPos({col: 0, row: 0});
    setT5Trail([{col: 0, row: 0}]);
    setT5CurrentCycle(null);

    const trajectory: {col: number; row: number; cycle: number}[] = [];
    let curC = 0;
    let curR = 0;
    for (let c = 1; c <= t5Cycles; c++) {
      curC = Math.min(3, curC + 1);
      trajectory.push({col: curC, row: curR, cycle: c});
      curR = Math.min(3, curR + 1);
      trajectory.push({col: curC, row: curR, cycle: c});
    }

    let frame = 0;
    const interval = setInterval(() => {
      if (frame < trajectory.length) {
        const node = trajectory[frame];
        setT5AgentPos({col: node.col, row: node.row});
        setT5Trail((prev) => [...prev, {col: node.col, row: node.row}]);
        setT5CurrentCycle(node.cycle);
        gameAudio.playFootstepStone();
        frame++;
      } else {
        clearInterval(interval);
        setT5Simulating(false);
        const finalNode = trajectory[trajectory.length - 1] || {col: 0, row: 0};
        const isGoal = finalNode.col === 3 && finalNode.row === 3;
        if (isGoal) {
          gameAudio.playVictoryFanfare();
          setT5Feedback({
            status: 'success',
            title: 'Apex Vault Terminal Reached!',
            message: `Synthesis complete! ${t5Cycles} automated diagonal cycles navigated through the security sector to the Vault Terminal.`,
            pedagogicalTip: 'Combining variables and iteration creates concise, scalable, professional Python code.',
          });
        } else {
          gameAudio.playConfirmSelect();
          setT5Feedback({
            status: 'neutral',
            title: `Completed ${t5Cycles} Cycles [Col ${finalNode.col}, Row ${finalNode.row}]`,
            message: `Agent progressed across ${trajectory.length} steps. Vault Terminal is at (3,3).`,
            pedagogicalTip: 'Set cycles = 3 to step all the way down to the Supreme Vault Terminal!',
          });
        }
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col bg-[#0B111E] text-slate-100 font-sans select-none">
      {!assetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0B111E] text-white font-mono">
          <div className="flex items-center gap-3 text-[#4EFA8B] text-xl font-bold animate-pulse">
            <TerminalIcon size={28} />
            <span>CONNECTING SECURE CYBER TERMINAL...</span>
          </div>
          <div className="text-slate-400 text-xs mt-2">
            Loading facility schematics and cryptographic manual modules
          </div>
        </div>
      )}

      {/* Espionage Background Music */}
      <BackgroundMusic
        url={BACKGROUND_MUSIC_URL}
        isPlaying={isMusicPlaying}
        isMuted={isMusicMuted}
      />

      {/* GLOBAL TOP NAVIGATION / BREADCRUMB BAR */}
      <header className="w-full shrink-0 bg-[#0F172A] border-b border-[#1E293B] px-3 md:px-5 py-2 flex flex-wrap items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-3">
          {/* Main Logo & Title */}
          <button
            onClick={() => {
              gameAudio.playCrispClick();
              setCurrentView('home');
            }}
            className="flex items-center gap-2 group text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4EFA8B] animate-ping" />
            <h1 className="font-mono font-black text-sm md:text-base tracking-wider text-[#4EFA8B] group-hover:text-emerald-300 transition-colors uppercase">
              Mission: Code
            </h1>
          </button>

          {/* Breadcrumb Trail */}
          <nav className="hidden sm:flex items-center text-xs font-mono text-[#CBD5E1] gap-1.5 border-l border-slate-700/80 pl-3">
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setCurrentView('home');
              }}
              className={`hover:text-[#4EFA8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4EFA8B] rounded px-1 transition-colors ${
                currentView === 'home' ? 'text-[#4EFA8B] font-bold' : ''
              }`}>
              HQ
            </button>
            <span>&gt;</span>
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setCurrentView('building');
              }}
              className={`hover:text-[#4EFA8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4EFA8B] rounded px-1 transition-colors ${
                currentView === 'building' ? 'text-[#4EFA8B] font-bold' : ''
              }`}>
              Facility Map
            </button>

            {currentView !== 'home' && currentView !== 'building' && (
              <>
                <span>&gt;</span>
                <span className="text-[#FFD166] font-bold">
                  Floor {currentFloor.floorNumber}: {currentFloor.title}
                </span>
                <span>&gt;</span>
                <span className="text-[#B497FF] uppercase font-bold">
                  {currentView === 'training'
                    ? 'Training'
                    : currentView === 'gameplay'
                    ? 'Start Mission'
                    : 'Mission Complete'}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Action Controls & Audio */}
        <div className="flex items-center gap-2">
          {/* Audio Quick Toggles */}
          <button
            onClick={() => {
              const muted = gameAudio.toggleMute();
              setIsSfxMuted(muted);
            }}
            title={isSfxMuted ? 'Unmute SFX' : 'Mute SFX'}
            className={`p-2 rounded-lg border text-xs flex items-center transition-colors min-h-[36px] min-w-[36px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isSfxMuted
                ? 'bg-rose-950/40 border-rose-700 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-[#4EFA8B]'
            }`}>
            {isSfxMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={() => setIsMusicMuted((prev) => !prev)}
            title={isMusicMuted ? 'Unmute Music' : 'Mute Music'}
            className={`p-2 rounded-lg border text-xs flex items-center transition-colors min-h-[36px] min-w-[36px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isMusicMuted
                ? 'bg-rose-950/40 border-rose-700 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-[#B497FF]'
            }`}>
            {isMusicMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Replay Tutorial Walkthrough (When in gameplay) */}
          {currentView === 'gameplay' && (
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setTourStep(0);
                setIsTourOpen(true);
              }}
              title="Replay Onboarding Walkthrough"
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-mono flex items-center gap-1.5 transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <HelpCircle size={15} className="text-[#4EFA8B]" />
              <span className="hidden sm:inline font-bold">Tutorial Guide</span>
            </button>
          )}

          {/* Tools Container (Field Guide + Facility Map) for Onboarding Tour Target */}
          <div data-tour="tools" className="flex items-center gap-2">
            {/* Field Guide Help */}
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              title="Field Guide"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-mono flex items-center gap-1.5 transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <BookOpen size={15} className="text-[#FFD166]" />
              <span className="hidden md:inline font-bold">Field Guide</span>
            </button>

            {/* Map Return Button when inside gameplay or training */}
            {(currentView === 'gameplay' || currentView === 'training') && (
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setCurrentView('building');
                }}
                title="Return to Facility Map"
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-mono flex items-center gap-1.5 transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <Layers size={15} className="text-[#4EFA8B]" />
                <span className="hidden sm:inline font-bold">Facility Map</span>
              </button>
            )}
          </div>

          {/* Gameplay Menu Button */}
          {currentView === 'gameplay' && (
            <button
              onClick={() => setIsGameMenuOpen(true)}
              data-testid="menu-button"
              className="px-3.5 py-2 rounded-lg bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs flex items-center gap-1 shadow-md min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <Menu size={16} />
              <span>MENU</span>
            </button>
          )}
        </div>
      </header>

      {/* VIEW 1: HEADQUARTERS / HOME SCREEN ('home') */}
      {currentView === 'home' && (
        <section className="flex-1 w-full min-h-0 flex flex-col lg:flex-row overflow-y-auto touch-auto p-4 md:p-8 gap-6 max-w-7xl mx-auto items-center justify-center">
          {/* Left Column: Mission Narrative & Command Interface */}
          <div className="flex-1 max-w-xl flex flex-col space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-[#4EFA8B]/30 text-[#4EFA8B] text-xs font-mono w-fit">
              <Shield size={14} />
              <span>CLASSIFIED INTELLIGENCE DOSSIER</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white">
                OPERATION: <span className="text-[#4EFA8B]">PYTHON</span> VAULT
              </h2>
              <p className="text-[#B497FF] font-mono text-sm tracking-wider uppercase">
                5-Story High-Security Cybersecurity Facility
              </p>
            </div>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Agent Cipher, hostile digital defense protocols have seized the
              research compound. Your directive: infiltrate the 5-story facility
              using genuine Python programming logic, bypass automated security
              grids, and retrieve the classified artifact: the{' '}
              <strong className="text-[#FFD166]">
                "Top Secret Python Manual"
              </strong>{' '}
              locked in the Floor 5 Vault.
            </p>

            {/* Quick Metrics Badge */}
            <div className="grid grid-cols-3 gap-3 bg-[#111827] border border-[#334155] p-3 rounded-xl font-mono text-xs text-center shadow-md">
              <div>
                <span className="block text-[#94A3B8] text-[10px] uppercase font-bold">
                  Current Clearance
                </span>
                <strong className="text-[#4EFA8B] text-base">
                  Floor {highestUnlockedFloor} / 5
                </strong>
              </div>
              <div>
                <span className="block text-[#94A3B8] text-[10px] uppercase font-bold">
                  Completed
                </span>
                <strong className="text-[#FFD166] text-base">
                  {saveData.completedFloors.length} Floors
                </strong>
              </div>
              <div>
                <span className="block text-[#94A3B8] text-[10px] uppercase font-bold">
                  Total Score
                </span>
                <strong className="text-[#B497FF] text-base">
                  {Object.values(saveData.highScores).reduce(
                    (a, b) => a + b,
                    0,
                  )}{' '}
                  pts
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => enterMission(highestUnlockedFloor)}
                data-testid="start-mission-button"
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#4EFA8B] hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-mono font-black text-sm md:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B111E]">
                <Play size={18} fill="currentColor" />
                <span>
                  {saveData.completedFloors.length > 0
                    ? `CONTINUE (FLOOR ${highestUnlockedFloor})`
                    : 'START MISSION'}
                </span>
              </button>

              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setCurrentView('building');
                }}
                className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-mono font-bold text-xs md:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B111E]">
                <Layers size={18} className="text-[#B497FF]" />
                <span>FACILITY MAP</span>
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Cross-Section Representation */}
          <div className="w-full lg:w-[420px] flex flex-col items-center">
            <FacilityElevationViewer
              selectedFloorId={highestUnlockedFloor}
              onSelectFloor={(floorId) => {
                setSelectedFloorId(floorId);
                enterMission(floorId);
              }}
              unlockedFloors={saveData.unlockedFloors}
              completedFloors={saveData.completedFloors}
              floorRatings={saveData.floorRatings}
              buildingImg={assets['facility_building_elevation']}
              onLockedClick={(floor) => setLockedDossierFloor(floor)}
              compact={true}
            />
          </div>
        </section>
      )}

      {/* VIEW 2: BUILDING / FLOOR SELECTION SCREEN ('building') */}
      {currentView === 'building' && (
        <section className="flex-1 w-full min-h-0 overflow-y-auto touch-auto p-3 sm:p-5 md:p-8 max-w-6xl mx-auto flex flex-col space-y-6">
          {/* Facility Map Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#4EFA8B]">
                <Layers size={16} />
                <span>FACILITY ARCHITECTURAL ELEVATION & SECURITY MATRIX</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-mono text-white mt-1">
                FACILITY MAP
              </h2>
            </div>

            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setCurrentView('home');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors">
              <ArrowLeft size={14} />
              <span>Back to HQ</span>
            </button>
          </div>

          {/* 2-Column Responsive Split View: Left (Centerpiece Elevation) & Right (Contextual Intel Panel) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Interactive Illustrated Building Centerpiece */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center justify-start">
              <FacilityElevationViewer
                selectedFloorId={selectedFloorId}
                onSelectFloor={(floorId) => setSelectedFloorId(floorId)}
                unlockedFloors={saveData.unlockedFloors}
                completedFloors={saveData.completedFloors}
                floorRatings={saveData.floorRatings}
                buildingImg={assets['facility_building_elevation']}
              />
            </div>

            {/* Right Column: Single Contextual Mission Details Intel Panel */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
              {(() => {
                const isUnlocked = saveData.unlockedFloors.includes(currentFloor.id);
                const isCompleted = saveData.completedFloors.includes(currentFloor.id);
                const sliceInfo = FLOOR_SLICES.find((s) => s.id === currentFloor.id);

                return (
                  <div className="h-full bg-[#0F172A] border-2 border-[#1E293B] rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-5">
                    {/* Background blueprint decorative scan accents */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                      {/* Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#4EFA8B] animate-ping" />
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                            SECTOR INTEL // ELEVATION {sliceInfo?.elevation || '0m'}
                          </span>
                        </div>

                        {/* Progress Status Badge with accessible icon and text */}
                        <div>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-[#4EFA8B] text-xs font-mono font-bold shadow-md shadow-emerald-500/20">
                              <Check size={14} className="stroke-[3]" />
                              <span>[✓ COMPLETED]</span>
                              <span className="inline-flex items-center gap-0.5 text-[#FFD166] ml-1">
                                {Array.from({length: saveData.floorRatings?.[currentFloor.id] || 3}).map((_, si) => (
                                  <Star key={si} size={11} className="fill-[#FFD166] text-[#FFD166]" />
                                ))}
                              </span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 border border-[#FFD166] text-[#FFD166] text-xs font-mono font-bold shadow-md shadow-amber-500/20 animate-pulse">
                              <Zap size={14} />
                              <span>[⚡ ACTIVE / UNLOCKED]</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                              <Lock size={14} className="text-rose-400" />
                              <span>[🔒 LOCKED - CLEARANCE REQUIRED]</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Floor Title and Codename */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[#FFD166] uppercase tracking-wider">
                            {sliceInfo?.sectorTag}
                          </span>
                          <span className="text-slate-600 font-mono text-xs">•</span>
                          <span className="font-mono text-xs text-[#B497FF] font-semibold">
                            {currentFloor.codename}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                          Floor {currentFloor.floorNumber}: {currentFloor.title}
                        </h3>
                      </div>

                      {/* Python Concept Tag with Code Icon */}
                      <div className="bg-[#070C16] border border-slate-800 p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-[#4EFA8B]/30 flex items-center justify-center text-[#4EFA8B] shrink-0">
                            <Code size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#94A3B8] block uppercase">
                              Python Learning Concept
                            </span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#4EFA8B]">
                              {currentFloor.concept}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] sm:text-xs px-2.5 py-1 rounded-lg bg-purple-950/80 text-[#B497FF] border border-purple-800 font-bold shrink-0">
                          TAG: {currentFloor.conceptTag}
                        </span>
                      </div>

                      {/* Mission Objective Briefing */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFD166] uppercase tracking-wider">
                          <TerminalIcon size={14} />
                          <span>Mission Briefing</span>
                        </div>
                        <div className="bg-[#0B111E]/80 border border-slate-750 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm text-slate-100 leading-relaxed font-sans shadow-inner">
                          {currentFloor.briefing}
                        </div>
                      </div>

                      {/* Tactical Dossier */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B497FF] uppercase tracking-wider">
                          <Sparkles size={14} />
                          <span>Tactical Dossier</span>
                        </div>
                        <div className="bg-[#0B111E]/80 border border-slate-750 rounded-xl p-3 sm:p-3.5 text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
                          {currentFloor.intelDossier}
                        </div>
                      </div>

                      {/* Floor 5 Apex Vault Callout */}
                      {currentFloor.id === 5 && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-[#FFD166]/40 flex items-start gap-3">
                          <Award size={20} className="text-[#FFD166] shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-mono font-bold text-[#FFD166] block mb-0.5">
                              FINAL ARTIFACT VAULT
                            </span>
                            <span className="text-slate-200">
                              Contains the classified manual "Top Secret Python Manual". Retrieve this artifact to complete Operation Python Vault.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Area: Buttons for Unlocked Floors / Clearance Message for Locked Floors */}
                    <div className="pt-2 border-t border-[#1E293B] relative z-10">
                      {isUnlocked ? (
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => {
                                setSelectedFloorId(currentFloor.id);
                                setCurrentView('training');
                              }}
                              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-100 border border-slate-600 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]">
                              <BookOpen size={16} className="text-[#FFD166]" />
                              <span>
                                {isCompleted
                                  ? 'REVIEW TRAINING'
                                  : 'TRAINING (SANDBOX)'}
                              </span>
                            </button>

                            <button
                              onClick={() => enterMission(currentFloor.id, isCompleted)}
                              className="flex-1 py-3 px-4 rounded-xl bg-[#4EFA8B] hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]">
                              <Play size={16} fill="currentColor" />
                              <span>
                                {isCompleted
                                  ? 'REPLAY MISSION'
                                  : `START FLOOR ${currentFloor.floorNumber} MISSION`}
                              </span>
                            </button>
                          </div>

                          {isCompleted && (
                            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 px-1 pt-1 gap-2">
                              <span>
                                Best Rating:{' '}
                                <strong className="text-[#FFD166] font-bold">
                                  {saveData.floorRatings?.[currentFloor.id] || 3} of 3 Stars
                                </strong>
                              </span>
                              <span>
                                High Score:{' '}
                                <strong className="text-[#4EFA8B] font-bold">
                                  {saveData.highScores[currentFloor.id] || 0} pts
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Clear Explanatory Security Locked Message */
                        <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-700 space-y-3 font-mono text-xs">
                          <div className="flex items-center gap-2 text-amber-300 font-bold">
                            <Lock size={16} className="text-amber-400" />
                            <span>
                              LOCKED: Complete Floor {currentFloor.floorNumber - 1} to unlock clearance
                            </span>
                          </div>

                          <p className="text-slate-200 font-sans leading-relaxed text-xs">
                            Security clearance required for {currentFloor.title}. Complete Floor {currentFloor.floorNumber - 1} to acquire the cipher keys.
                          </p>

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                            <span className="text-xs text-amber-200 font-bold">
                              Unlock Condition: Complete Floor {currentFloor.floorNumber - 1}
                            </span>
                            <button
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setSelectedFloorId(highestUnlockedFloor);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[#4EFA8B] border border-emerald-500/60 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                              <span>Jump to Floor {highestUnlockedFloor}</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* VIEW 3: PRE-MISSION INTERACTIVE LEARNING MODULE ('training') */}
      {currentView === 'training' && (() => {
        const lesson = LESSON_MODULES[selectedFloorId] || LESSON_MODULES[1];
        const isFloorUnlocked = saveData.unlockedFloors.includes(selectedFloorId);

        return (
          <section className="flex-1 w-full min-h-0 overflow-y-auto touch-auto p-3 sm:p-5 md:p-8 max-w-5xl mx-auto flex flex-col space-y-6">
            {/* Header: Title, Floor Indicator, Back Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#4EFA8B]">
                  <Shield size={16} />
                  <span>PRE-MISSION TACTICAL BRIEFING // CLASSIFIED INTEL</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-white tracking-tight">
                    {lesson.floorTitle}: {lesson.concept}
                  </h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[#B497FF] border border-purple-500/40">
                    {lesson.badge}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Floor Switcher Pills (Review any unlocked floor's lesson) */}
                <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-xl border border-slate-700">
                  {[1, 2, 3, 4, 5].map((fId) => {
                    const isFUnlocked = saveData.unlockedFloors.includes(fId);
                    const isFSelected = selectedFloorId === fId;
                    return (
                      <button
                        key={fId}
                        disabled={!isFUnlocked}
                        onClick={() => {
                          gameAudio.playCrispClick();
                          setSelectedFloorId(fId);
                        }}
                        title={isFUnlocked ? `Review Floor ${fId} Lesson` : `Floor ${fId} Locked`}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center ${
                          isFSelected
                            ? 'bg-[#4EFA8B] text-slate-950 shadow-md font-black'
                            : isFUnlocked
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                            : 'text-slate-600 cursor-not-allowed opacity-40'
                        }`}>
                        {fId}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    gameAudio.playCrispClick();
                    setCurrentView('building');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700 min-h-[36px]">
                  <ArrowLeft size={14} />
                  <span>Back to Map</span>
                </button>
              </div>
            </div>

            {/* Concept Introduction & Syntax Explanation Card */}
            <div className="bg-[#0F172A] border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#4EFA8B]">
                <Code size={18} className="text-[#FFD166]" />
                <span className="uppercase tracking-wider">
                  CONCEPT OVERVIEW: {lesson.concept}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {lesson.introduction}
              </p>

              {/* 2-Column: Code Sample & Step-by-Step Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Code Sample Box */}
                <div className="bg-[#070C16] p-3.5 rounded-xl border border-slate-750 font-mono text-xs space-y-1 text-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800 mb-2 font-bold">
                    <span>Python Code Example</span>
                    <span className="text-[#4EFA8B]">python 3.x</span>
                  </div>
                  <div className="space-y-1">
                    {lesson.codeExample.map((line, idx) => (
                      <div
                        key={idx}
                        className={
                          line.startsWith('#')
                            ? 'text-slate-500 italic'
                            : line.includes('def') || line.includes('for') || line.includes('if')
                            ? 'text-[#B497FF] font-bold'
                            : line.includes('=')
                            ? 'text-[#FFD166] font-bold'
                            : 'text-[#4EFA8B] font-semibold'
                        }>
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 mt-2">
                    Execute sequentially in program flow
                  </div>
                </div>

                {/* Step-by-Step Interpretation Breakdown */}
                <div className="bg-[#070C16] p-3.5 rounded-xl border border-slate-755 font-mono text-xs space-y-2 text-slate-200 flex flex-col justify-between">
                  <div className="text-[11px] text-slate-400 pb-1 border-b border-slate-800 font-bold">
                    Step-by-Step Execution Breakdown
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
                    {lesson.explanation.map((item, idx) => (
                      <div key={idx} className="space-y-0.5 text-xs">
                        <code className="text-[#FFD166] font-bold block bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 w-fit">
                          {item.line}
                        </code>
                        <p className="text-slate-300 font-sans text-xs leading-relaxed pl-1">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Practice Sandbox Card */}
            <div className="bg-[#0F172A] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4EFA8B] animate-pulse" />
                  <h4 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Interactive Practice Sandbox // Floor {selectedFloorId}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {lesson.practiceInstructions}
                </span>
              </div>

              {/* FLOOR 1: SEQUENCING SANDBOX */}
              {selectedFloorId === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Command Sequencer Controls */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span>Programmed Lines ({t1Steps.length}/4 max):</span>
                      <button
                        onClick={addT1Step}
                        disabled={t1Steps.length >= 4 || t1Simulating}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[#4EFA8B] border border-slate-700 font-bold transition-all flex items-center gap-1">
                        + Add Command
                      </button>
                    </div>

                    <div className="space-y-2">
                      {t1Steps.map((step, idx) => (
                        <div
                          key={step.id}
                          className={`p-3 rounded-xl border transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs font-mono ${
                            t1ActiveStepIdx === idx
                              ? 'bg-emerald-950/60 border-[#4EFA8B] shadow-md shadow-emerald-500/20 ring-1 ring-[#4EFA8B]'
                              : 'bg-[#070C16] border-slate-700 hover:border-slate-600'
                          }`}>
                          {/* Line Indicator */}
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-800 text-[#F1F5F9] flex items-center justify-center font-bold text-[11px] border border-slate-700">
                              {idx + 1}
                            </span>

                            {/* Direction Selector Dropdown */}
                            <select
                              value={step.dir}
                              disabled={t1Simulating}
                              onChange={(e) => {
                                const newDir = e.target.value as 'right' | 'down' | 'left' | 'up';
                                gameAudio.playCrispClick();
                                setT1Steps((prev) => {
                                  const next = [...prev];
                                  next[idx] = {...next[idx], dir: newDir};
                                  return next;
                                });
                              }}
                              className="bg-slate-800 text-[#4EFA8B] font-bold px-2 py-1.5 rounded-lg border border-slate-700 outline-none cursor-pointer">
                              <option value="right">move_right</option>
                              <option value="down">move_down</option>
                              <option value="left">move_left</option>
                              <option value="up">move_up</option>
                            </select>
                          </div>

                          {/* Step Count +/- Controls */}
                          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-slate-400 text-[11px]">steps:</span>
                            <button
                              disabled={t1Simulating || step.count <= 1}
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setT1Steps((prev) => {
                                  const next = [...prev];
                                  next[idx] = {
                                    ...next[idx],
                                    count: Math.max(1, next[idx].count - 1),
                                  };
                                  return next;
                                });
                              }}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[#F1F5F9] font-black flex items-center justify-center">
                              -
                            </button>
                            <span className="w-6 text-center text-[#FFD166] font-bold text-sm">
                              {step.count}
                            </span>
                            <button
                              disabled={t1Simulating || step.count >= 4}
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setT1Steps((prev) => {
                                  const next = [...prev];
                                  next[idx] = {
                                    ...next[idx],
                                    count: Math.min(4, next[idx].count + 1),
                                  };
                                  return next;
                                });
                              }}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[#F1F5F9] font-black flex items-center justify-center">
                              +
                            </button>
                          </div>

                          {/* Reordering & Delete Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              disabled={t1Simulating || idx === 0}
                              onClick={() => moveT1StepOrder(idx, 'up')}
                              title="Move command up in execution sequence"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[#B497FF] border border-slate-700">
                              ▲
                            </button>
                            <button
                              disabled={t1Simulating || idx === t1Steps.length - 1}
                              onClick={() => moveT1StepOrder(idx, 'down')}
                              title="Move command down in execution sequence"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[#B497FF] border border-slate-700">
                              ▼
                            </button>
                            {t1Steps.length > 1 && (
                              <button
                                disabled={t1Simulating}
                                onClick={() => removeT1Step(idx)}
                                title="Remove this command line"
                                className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 ml-1">
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Test Sequence Run Button */}
                    <div className="pt-2">
                      <button
                        onClick={runT1Simulation}
                        disabled={t1Simulating}
                        className={`w-full py-3 rounded-xl font-mono text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                          t1Simulating
                            ? 'bg-slate-700 text-slate-400 cursor-wait'
                            : 'bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
                        }`}>
                        <Play size={16} fill="currentColor" />
                        <span>{t1Simulating ? 'SIMULATING EXECUTION...' : 'TEST SEQUENCE RUN'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 4x4 Mini-Grid Visualizer */}
                  <div className="lg:col-span-5 flex flex-col items-center bg-[#070C16] p-4 rounded-xl border border-slate-700">
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                      <span>Start: (0,0)</span>
                      <span>Target: (3,3) 💻</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#0B111E] rounded-xl border-2 border-slate-700 relative">
                      {Array.from({length: 16}).map((_, i) => {
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        const isAgent = t1AgentPos.col === col && t1AgentPos.row === row;
                        const isTarget = col === 3 && row === 3;
                        const isVisited = t1Trail.some((pos) => pos.col === col && pos.row === row);

                        return (
                          <div
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center text-xs font-mono relative transition-all duration-150 ${
                              isAgent
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-400/50 scale-105 z-10 ring-2 ring-[#FFD166]'
                                : isTarget
                                ? 'bg-amber-500/20 text-[#FFD166] border-2 border-[#FFD166] animate-pulse'
                                : isVisited
                                ? 'bg-emerald-950/40 border border-emerald-800/60 text-[#4EFA8B]'
                                : 'bg-[#111827] border border-slate-800 text-slate-500'
                            }`}>
                            {isAgent ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">🕵️</span>
                                <span className="text-[8px] font-mono font-black tracking-tighter bg-black/60 text-[#4EFA8B] px-1 rounded -mt-0.5">
                                  CIPHER
                                </span>
                              </div>
                            ) : isTarget ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">💻</span>
                                <span className="text-[8px] text-[#FFD166] font-bold">TERMINAL</span>
                              </div>
                            ) : isVisited ? (
                              <span className="w-2 h-2 rounded-full bg-[#4EFA8B] opacity-70" />
                            ) : (
                              <span className="text-[9px] text-slate-500 opacity-60">
                                {col},{row}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                      Real-time interactive path tracer
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 2: VARIABLES SANDBOX */}
              {selectedFloorId === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="space-y-3 bg-[#070C16] p-4 rounded-xl border border-slate-750 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-300 font-bold">Variable 1: stride (Down steps)</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3].map((val) => (
                            <button
                              key={val}
                              disabled={t2Simulating}
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setT2Stride(val);
                              }}
                              className={`w-8 h-8 rounded-lg font-bold border transition-colors ${
                                t2Stride === val
                                  ? 'bg-[#FFD166] text-slate-950 border-[#FFD166]'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}>
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-300 font-bold">Variable 2: traverse (Right steps)</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3].map((val) => (
                            <button
                              key={val}
                              disabled={t2Simulating}
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setT2Traverse(val);
                              }}
                              className={`w-8 h-8 rounded-lg font-bold border transition-colors ${
                                t2Traverse === val
                                  ? 'bg-[#B497FF] text-slate-950 border-[#B497FF]'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}>
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Code Preview showing variable propagation */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500 font-mono text-[10px]"># Python Dynamic Script:</div>
                        <div className="text-[#FFD166] font-bold">stride = {t2Stride}</div>
                        <div className="text-[#B497FF] font-bold">traverse = {t2Traverse}</div>
                        <div className={`transition-colors ${t2ActiveVar === 'stride' ? 'text-emerald-300 bg-emerald-950/80 px-1 rounded' : 'text-slate-300'}`}>
                          move_down(stride) <span className="text-slate-500">&rarr; Advances {t2Stride} cells South</span>
                        </div>
                        <div className={`transition-colors ${t2ActiveVar === 'traverse' ? 'text-emerald-300 bg-emerald-950/80 px-1 rounded' : 'text-slate-300'}`}>
                          move_right(traverse) <span className="text-slate-500">&rarr; Advances {t2Traverse} cells East</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={runT2Simulation}
                      disabled={t2Simulating}
                      className={`w-full py-3 rounded-xl font-mono text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                        t2Simulating
                          ? 'bg-slate-700 text-slate-400 cursor-wait'
                          : 'bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
                      }`}>
                      <Play size={16} fill="currentColor" />
                      <span>{t2Simulating ? 'SIMULATING VARIABLE EXECUTION...' : 'TEST VARIABLE RUN'}</span>
                    </button>
                  </div>

                  {/* 4x4 Mini-Grid Visualizer */}
                  <div className="lg:col-span-5 flex flex-col items-center bg-[#070C16] p-4 rounded-xl border border-slate-700">
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                      <span>Start: (0,0)</span>
                      <span>Target: (3,3) 💻</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#0B111E] rounded-xl border-2 border-slate-700 relative">
                      {Array.from({length: 16}).map((_, i) => {
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        const isAgent = t2AgentPos.col === col && t2AgentPos.row === row;
                        const isTarget = col === 3 && row === 3;
                        const isVisited = t2Trail.some((pos) => pos.col === col && pos.row === row);

                        return (
                          <div
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center text-xs font-mono relative transition-all duration-150 ${
                              isAgent
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-400/50 scale-105 z-10 ring-2 ring-[#FFD166]'
                                : isTarget
                                ? 'bg-amber-500/20 text-[#FFD166] border-2 border-[#FFD166] animate-pulse'
                                : isVisited
                                ? 'bg-emerald-950/40 border border-emerald-800/60 text-[#4EFA8B]'
                                : 'bg-[#111827] border border-slate-800 text-slate-500'
                            }`}>
                            {isAgent ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">🕵️</span>
                                <span className="text-[8px] font-mono font-black tracking-tighter bg-black/60 text-[#4EFA8B] px-1 rounded -mt-0.5">
                                  CIPHER
                                </span>
                              </div>
                            ) : isTarget ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">💻</span>
                                <span className="text-[8px] text-[#FFD166] font-bold">TERMINAL</span>
                              </div>
                            ) : isVisited ? (
                              <span className="w-2 h-2 rounded-full bg-[#4EFA8B] opacity-70" />
                            ) : (
                              <span className="text-[9px] text-slate-500 opacity-60">
                                {col},{row}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                      Adjusting stride & traverse updates movement distances
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 3: FOR LOOPS SANDBOX */}
              {selectedFloorId === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="space-y-3 bg-[#070C16] p-4 rounded-xl border border-slate-750 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-300 font-bold">Set Loop Repeat Count:</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4].map((count) => (
                            <button
                              key={count}
                              disabled={t3Simulating}
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setT3Repeat(count);
                              }}
                              className={`w-8 h-8 rounded-lg font-bold border transition-colors ${
                                t3Repeat === count
                                  ? 'bg-[#B497FF] text-slate-950 border-[#B497FF]'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}>
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Code Preview showing Loop Structure */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500 font-mono text-[10px]"># Python For-Loop Automation:</div>
                        <div className="text-[#FFD166] font-bold">repeat = {t3Repeat}</div>
                        <div className="text-[#B497FF] font-bold">for step in range(repeat):</div>
                        <div className="text-[#4EFA8B] pl-4 font-mono font-semibold">
                          move_right(1) <span className="text-slate-500"># Runs {t3Repeat} times automatically</span>
                        </div>
                      </div>

                      {/* Iteration Status Badge */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400">Current Loop Iteration:</span>
                        <span className="font-bold text-[#FFD166] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                          {t3CurrentIter ? `Iteration ${t3CurrentIter} of ${t3Repeat}` : 'Ready to Loop'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={runT3Simulation}
                      disabled={t3Simulating}
                      className={`w-full py-3 rounded-xl font-mono text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                        t3Simulating
                          ? 'bg-slate-700 text-slate-400 cursor-wait'
                          : 'bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
                      }`}>
                      <Play size={16} fill="currentColor" />
                      <span>{t3Simulating ? 'SIMULATING LOOP ITERATIONS...' : 'TEST LOOP RUN'}</span>
                    </button>
                  </div>

                  {/* 4x4 Mini-Grid Visualizer */}
                  <div className="lg:col-span-5 flex flex-col items-center bg-[#070C16] p-4 rounded-xl border border-slate-700">
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                      <span>Start: (0,0)</span>
                      <span>Target: (3,0) 💻</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#0B111E] rounded-xl border-2 border-slate-700 relative">
                      {Array.from({length: 16}).map((_, i) => {
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        const isAgent = t3AgentPos.col === col && t3AgentPos.row === row;
                        const isTarget = col === 3 && row === 0;
                        const isVisited = t3Trail.some((pos) => pos.col === col && pos.row === row);

                        return (
                          <div
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center text-xs font-mono relative transition-all duration-150 ${
                              isAgent
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-400/50 scale-105 z-10 ring-2 ring-[#FFD166]'
                                : isTarget
                                ? 'bg-amber-500/20 text-[#FFD166] border-2 border-[#FFD166] animate-pulse'
                                : isVisited
                                ? 'bg-emerald-950/40 border border-emerald-800/60 text-[#4EFA8B]'
                                : 'bg-[#111827] border border-slate-800 text-slate-500'
                            }`}>
                            {isAgent ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">🕵️</span>
                                <span className="text-[8px] font-mono font-black tracking-tighter bg-black/60 text-[#4EFA8B] px-1 rounded -mt-0.5">
                                  CIPHER
                                </span>
                              </div>
                            ) : isTarget ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">💻</span>
                                <span className="text-[8px] text-[#FFD166] font-bold">TERMINAL</span>
                              </div>
                            ) : isVisited ? (
                              <span className="w-2 h-2 rounded-full bg-[#4EFA8B] opacity-70" />
                            ) : (
                              <span className="text-[9px] text-slate-500 opacity-60">
                                {col},{row}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                      Loop iterates without duplicating lines of code
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 4: CONDITIONALS SANDBOX */}
              {selectedFloorId === 4 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="space-y-3 bg-[#070C16] p-4 rounded-xl border border-slate-750 font-mono text-xs">
                      {/* Keycard Inventory Boolean Toggle */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <span className="text-slate-300 font-bold block">Boolean Variable: has_key</span>
                          <span className="text-[10px] text-slate-400">Represents keycard possession (True or False)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={t4Simulating}
                            onClick={() => {
                              gameAudio.playCrispClick();
                              setT4HasKey(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                              !t4HasKey
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                            has_key = False
                          </button>
                          <button
                            disabled={t4Simulating}
                            onClick={() => {
                              gameAudio.playCrispClick();
                              setT4HasKey(true);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                              t4HasKey
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                            has_key = True
                          </button>
                        </div>
                      </div>

                      {/* Live Code Preview showing If/Else evaluation */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500 font-mono text-[10px]"># Python Boolean &amp; Conditional Gate:</div>
                        <div className="text-[#FFD166] font-bold">
                          has_key = {t4HasKey ? 'True' : 'False'}{' '}
                          <span className="text-slate-500 text-[10px]">
                            {t4HasKey ? '# Physical keycard collected at B6' : '# Mission spawn state (uncollected)'}
                          </span>
                        </div>
                        <div className="text-[#B497FF] font-bold">
                          if has_key:{' '}
                          <span className="text-[10px] text-slate-400">
                            (Evaluates to <strong className={t4HasKey ? 'text-emerald-400' : 'text-rose-400'}>{t4HasKey ? 'True' : 'False'}</strong> &bull; colon : required)
                          </span>
                        </div>
                        <div className={`pl-4 transition-colors font-mono ${
                          t4HasKey
                            ? 'text-[#4EFA8B] font-bold bg-emerald-950/40 p-1 rounded'
                            : 'text-slate-600 line-through'
                        }`}>
                          unlock_door() <span className="text-slate-500 text-[10px]">{t4HasKey ? '# EXECUTED: Door at E4 unlocks!' : '# SKIPPED'}</span>
                        </div>
                        <div className={`pl-4 transition-colors font-mono ${
                          t4HasKey
                            ? 'text-[#4EFA8B] font-bold bg-emerald-950/40 p-1 rounded'
                            : 'text-slate-600 line-through'
                        }`}>
                          move_right(3) <span className="text-slate-500 text-[10px]">{t4HasKey ? '# EXECUTED: Advances to terminal!' : '# SKIPPED'}</span>
                        </div>
                        <div className="text-[#B497FF] font-bold">else:</div>
                        <div className={`pl-4 transition-colors font-mono ${
                          !t4HasKey
                            ? 'text-amber-400 font-bold bg-amber-950/40 p-1 rounded'
                            : 'text-slate-600 line-through'
                        }`}>
                          print("Find the keycard first.") <span className="text-slate-500 text-[10px]">{!t4HasKey ? '# EXECUTED: Fallback alert' : '# SKIPPED'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={runT4Simulation}
                      disabled={t4Simulating}
                      className={`w-full py-3 rounded-xl font-mono text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                        t4Simulating
                          ? 'bg-slate-700 text-slate-400 cursor-wait'
                          : 'bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
                      }`}>
                      <Play size={16} fill="currentColor" />
                      <span>{t4Simulating ? 'EVALUATING ACCESS BRANCH...' : 'TEST BRANCH RUN'}</span>
                    </button>
                  </div>

                  {/* 4x4 Mini-Grid Visualizer with Dynamic Door */}
                  <div className="lg:col-span-5 flex flex-col items-center bg-[#070C16] p-4 rounded-xl border border-slate-700">
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                      <span>Start: (0,0)</span>
                      <span>Target: (3,0) 💻</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#0B111E] rounded-xl border-2 border-slate-700 relative">
                      {Array.from({length: 16}).map((_, i) => {
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        const isAgent = t4AgentPos.col === col && t4AgentPos.row === row;
                        const isTarget = col === 3 && row === 0;
                        const isDoor = col === 2 && row === 0;
                        const isVisited = t4Trail.some((pos) => pos.col === col && pos.row === row);

                        return (
                          <div
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center text-xs font-mono relative transition-all duration-150 ${
                              isAgent
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-400/50 scale-105 z-10 ring-2 ring-[#FFD166]'
                                : isTarget
                                ? 'bg-amber-500/20 text-[#FFD166] border-2 border-[#FFD166] animate-pulse'
                                : isDoor
                                ? t4HasKey
                                  ? 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300'
                                  : 'bg-rose-950/80 border-2 border-rose-500 text-rose-300'
                                : isVisited
                                ? 'bg-emerald-950/40 border border-emerald-800/60 text-[#4EFA8B]'
                                : 'bg-[#111827] border border-slate-800 text-slate-500'
                            }`}>
                            {isAgent ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">🕵️</span>
                                <span className="text-[8px] font-mono font-black tracking-tighter bg-black/60 text-[#4EFA8B] px-1 rounded -mt-0.5">
                                  CIPHER
                                </span>
                              </div>
                            ) : isTarget ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">💻</span>
                                <span className="text-[8px] text-[#FFD166] font-bold">TERMINAL</span>
                              </div>
                            ) : isDoor ? (
                              <div className="flex flex-col items-center">
                                <span className="text-xs">{t4HasKey ? '🔓' : '🔒'}</span>
                                <span className="text-[7px] font-mono font-bold">
                                  {t4HasKey ? 'UNLOCKED' : 'LOCKED'}
                                </span>
                              </div>
                            ) : isVisited ? (
                              <span className="w-2 h-2 rounded-full bg-[#4EFA8B] opacity-70" />
                            ) : (
                              <span className="text-[9px] text-slate-500 opacity-60">
                                {col},{row}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                      Door at (2,0): has_key condition dynamically unlocks passage
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 5: COMBINED SYNTHESIS SANDBOX */}
              {selectedFloorId === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="space-y-3 bg-[#070C16] p-4 rounded-xl border border-slate-750 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-300 font-bold">Staircase Cycles:</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3].map((val) => (
                            <button
                              key={val}
                              disabled={t5Simulating}
                              onClick={() => {
                                gameAudio.playCrispClick();
                                setT5Cycles(val);
                              }}
                              className={`w-8 h-8 rounded-lg font-bold border transition-colors ${
                                t5Cycles === val
                                  ? 'bg-[#FFD166] text-slate-950 border-[#FFD166]'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}>
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Code Preview */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500 font-mono text-[10px]"># Supreme Synthesis Program:</div>
                        <div className="text-[#FFD166] font-bold">cycles = {t5Cycles}</div>
                        <div className="text-[#FFD166] font-bold">step_size = 1</div>
                        <div className="text-[#B497FF] font-bold">for i in range(cycles):</div>
                        <div className="text-[#4EFA8B] pl-4 font-mono font-semibold">
                          move_right(step_size)
                        </div>
                        <div className="text-[#4EFA8B] pl-4 font-mono font-semibold">
                          move_down(step_size)
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400">Automated Step Cycle:</span>
                        <span className="font-bold text-[#4EFA8B] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                          {t5CurrentCycle ? `Cycle ${t5CurrentCycle} of ${t5Cycles}` : 'Ready for Infiltration'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={runT5Simulation}
                      disabled={t5Simulating}
                      className={`w-full py-3 rounded-xl font-mono text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                        t5Simulating
                          ? 'bg-slate-700 text-slate-400 cursor-wait'
                          : 'bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
                      }`}>
                      <Play size={16} fill="currentColor" />
                      <span>{t5Simulating ? 'EXECUTING SYNTHESIS INFILTRATION...' : 'RUN SYNTHESIS SCRIPT'}</span>
                    </button>
                  </div>

                  {/* 4x4 Mini-Grid Visualizer */}
                  <div className="lg:col-span-5 flex flex-col items-center bg-[#070C16] p-4 rounded-xl border border-slate-700">
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                      <span>Start: (0,0)</span>
                      <span>Vault Target: (3,3) 💻★</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#0B111E] rounded-xl border-2 border-slate-700 relative">
                      {Array.from({length: 16}).map((_, i) => {
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        const isAgent = t5AgentPos.col === col && t5AgentPos.row === row;
                        const isTarget = col === 3 && row === 3;
                        const isVisited = t5Trail.some((pos) => pos.col === col && pos.row === row);

                        return (
                          <div
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center text-xs font-mono relative transition-all duration-150 ${
                              isAgent
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-400/50 scale-105 z-10 ring-2 ring-[#FFD166]'
                                : isTarget
                                ? 'bg-amber-500/20 text-[#FFD166] border-2 border-[#FFD166] animate-pulse'
                                : isVisited
                                ? 'bg-emerald-950/40 border border-emerald-800/60 text-[#4EFA8B]'
                                : 'bg-[#111827] border border-slate-800 text-slate-500'
                            }`}>
                            {isAgent ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">🕵️</span>
                                <span className="text-[8px] font-mono font-black tracking-tighter bg-black/60 text-[#4EFA8B] px-1 rounded -mt-0.5">
                                  CIPHER
                                </span>
                              </div>
                            ) : isTarget ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base">★</span>
                                <span className="text-[8px] text-[#FFD166] font-bold">VAULT</span>
                              </div>
                            ) : isVisited ? (
                              <span className="w-2 h-2 rounded-full bg-[#4EFA8B] opacity-70" />
                            ) : (
                              <span className="text-[9px] text-slate-500 opacity-60">
                                {col},{row}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                      Automated diagonal traversal combining variables & loop
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Pedagogical Diagnostic Feedback Banner */}
              {(() => {
                const fb =
                  selectedFloorId === 1
                    ? t1Feedback
                    : selectedFloorId === 2
                    ? t2Feedback
                    : selectedFloorId === 3
                    ? t3Feedback
                    : selectedFloorId === 4
                    ? t4Feedback
                    : t5Feedback;

                return (
                  <div
                    className={`p-4 rounded-xl border font-mono text-xs space-y-1.5 transition-all ${
                      fb.status === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : fb.status === 'warning'
                        ? 'bg-amber-950/50 border-amber-500/80 text-amber-200'
                        : fb.status === 'error'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                        : 'bg-[#070C16] border-slate-700 text-[#F1F5F9]'
                    }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {fb.status === 'success' ? (
                        <CheckCircle2 size={18} className="text-[#4EFA8B]" />
                      ) : fb.status === 'error' ? (
                        <AlertTriangle size={18} className="text-rose-400" />
                      ) : fb.status === 'warning' ? (
                        <Lightbulb size={18} className="text-[#FFD166]" />
                      ) : (
                        <Info size={18} className="text-[#B497FF]" />
                      )}
                      <span>{fb.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#F1F5F9] font-sans">
                      {fb.message}
                    </p>
                    <div className="text-[11px] text-[#FFD166] pt-1 border-t border-slate-800/80 flex items-start gap-1.5">
                      <span className="font-bold shrink-0">KEY INSIGHT:</span>
                      <span>{fb.pedagogicalTip}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Expected Outcome & Key Takeaway Banner */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs font-mono flex items-start gap-3">
              <Sparkles size={18} className="text-[#B497FF] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#B497FF] text-xs uppercase tracking-wider mb-1 font-bold">
                  EXPECTED OUTCOME & TACTICAL DIRECTIVE
                </strong>
                <p className="text-slate-200 font-sans text-xs leading-relaxed">
                  {lesson.expectedOutcome}
                </p>
              </div>
            </div>

            {/* Action Bar: Facility Map Navigation & Primary Start Mission Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E293B]">
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setCurrentView('building');
                }}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors min-h-[44px] border border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B111E]">
                &larr; FACILITY MAP
              </button>

              <button
                disabled={!isFloorUnlocked}
                onClick={() => {
                  updateSave((prev) => ({
                    ...prev,
                    hasCompletedTraining: true,
                  }));
                  enterMission(selectedFloorId, true);
                }}
                data-testid="ready-mission-button"
                className={`py-3.5 px-6 rounded-xl font-mono font-black text-sm md:text-base transition-all flex items-center gap-2 shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B111E] ${
                  isFloorUnlocked
                    ? 'bg-[#4EFA8B] hover:bg-emerald-400 active:scale-95 text-slate-950 shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}>
                <Play size={18} fill="currentColor" />
                <span>BEGIN FLOOR {currentFloor.floorNumber} MISSION &rarr;</span>
              </button>
            </div>
          </section>
        );
      })()}

      {/* VIEW 4: MAIN SPLIT-SCREEN GAMEPLAY ENGINE ('gameplay') */}
      {currentView === 'gameplay' && (
        <main className="flex-1 w-full min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden touch-auto relative overflow-x-hidden">
          {/* Accessible Screen-Reader Announcement Live Region for Milestone Events */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only">
            {liveAnnouncement}
          </div>
          {/* Grid target anchors for onboarding walkthrough: attached directly to Agent Cipher and Terminal tiles */}
          {gridTargetRects && (
            <>
              <div
                data-tour="agent"
                aria-hidden="true"
                className="fixed pointer-events-none z-0"
                style={{
                  left: `${gridTargetRects.agent.left}px`,
                  top: `${gridTargetRects.agent.top}px`,
                  width: `${gridTargetRects.agent.width}px`,
                  height: `${gridTargetRects.agent.height}px`,
                }}
              />
              <div
                data-tour="terminal"
                aria-hidden="true"
                className="fixed pointer-events-none z-0"
                style={{
                  left: `${gridTargetRects.terminal.left}px`,
                  top: `${gridTargetRects.terminal.top}px`,
                  width: `${gridTargetRects.terminal.width}px`,
                  height: `${gridTargetRects.terminal.height}px`,
                }}
              />
            </>
          )}

          {/* Left Hero: 8x8 Interactive Laboratory Canvas & Controls */}
          <section className="w-full lg:flex-1 shrink-0 lg:shrink min-h-0 flex flex-col items-center justify-between relative bg-[#0B111E] p-2 sm:p-2.5 overflow-hidden">
            {/* Compact Always-Visible Mission Objective Strip */}
            <div className="w-full max-w-2xl bg-[#0B111E] border border-[#334155] rounded-xl px-3 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-x-3 gap-y-0.5 shadow-md shrink-0 mb-1 z-10">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#4EFA8B] animate-pulse shrink-0" />
                <span className="font-mono font-bold text-[10px] sm:text-xs text-[#FFD166] uppercase tracking-wider shrink-0">
                  MISSION OBJECTIVE:
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-[#4EFA8B] shrink-0">
                  Reach the terminal at {COL_LABELS[currentFloor.terminal.col]}{ROW_LABELS[currentFloor.terminal.row]}.
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-tight sm:text-right">
                Guide Agent Cipher around walls and lasers using Python movement commands.
              </p>
            </div>

            <div className="w-full flex-1 min-h-[300px] sm:min-h-[360px] lg:min-h-0 flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onPointerDown={handleCanvasPointer}
                onPointerMove={handleCanvasPointer}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                }}
                className="drop-shadow-2xl rounded-lg cursor-crosshair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>

            {/* Quick Canvas Controls & Cell Inspector Floating Overlays */}
            <div className="w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 mt-2 px-1 z-10">
              {/* Tactical Cell Inspector Pill */}
              <div
                className="flex items-center justify-between gap-2 bg-[#0F172A] border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-200 shadow-md flex-1 min-w-[220px]"
                aria-live="polite">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold shrink-0">
                    Cell [{COL_LABELS[inspectedCell?.col ?? 0]},{' '}
                    {ROW_LABELS[inspectedCell?.row ?? 0]}]
                  </span>
                  <span className={`font-bold shrink-0 ${inspectedInfo.tone}`}>
                    {inspectedInfo.title}:
                  </span>
                  <span className="text-slate-300 truncate font-sans text-xs">
                    {inspectedInfo.desc}
                  </span>
                </div>
                {inspectedCell &&
                  MECHANIC_INTEL_CONFIGS[currentFloor.id] &&
                  ((currentFloor.cameras?.some((c) => c.col === inspectedCell.col && c.row === inspectedCell.row)) ||
                    (currentFloor.keycards?.some((k) => k.col === inspectedCell.col && k.row === inspectedCell.row)) ||
                    (currentFloor.doors?.some((d) => d.col === inspectedCell.col && d.row === inspectedCell.row)) ||
                    (currentFloor.vault && currentFloor.vault.col === inspectedCell.col && currentFloor.vault.row === inspectedCell.row)) && (
                    <button
                      type="button"
                      onClick={() => setIsMechanicBriefingOpen(true)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[#FFD166] border border-amber-400/50 text-[10px] font-bold shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                      title="View mechanic intelligence tutorial">
                      Intel ℹ️
                    </button>
                  )}
              </div>

              {/* Quick Canvas Controls Overlay */}
              <div className="flex items-center gap-1.5 bg-[#0F172A] px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono text-slate-300 shadow-md">
                <button
                  onClick={handleTogglePath}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    showPathProjection
                      ? 'bg-emerald-500/25 text-[#4EFA8B] border border-emerald-500/50 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  <Compass size={13} />
                  <span>Path: {showPathProjection ? 'ON' : 'OFF'}</span>
                </button>

                <span className="text-slate-700">|</span>

                <button
                  onClick={() => {
                    const nextSpeed =
                      executionSpeed === 1
                        ? 2
                        : executionSpeed === 2
                        ? 'instant'
                        : 1;
                    setExecutionSpeed(nextSpeed);
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title="Toggle animation speed or reduced motion instant mode">
                  <FastForward size={13} className="text-[#B497FF]" />
                  <span>
                    Speed:{' '}
                    <strong className="text-amber-300 font-bold">
                      {executionSpeed === 'instant' ? 'Instant' : `${executionSpeed}x`}
                    </strong>
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Hero: Python Code Editor, Clean Controls & Unified Status */}
          <section className="w-full lg:w-[460px] xl:w-[500px] shrink-0 bg-[#0F172A] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col min-h-0 lg:h-full overflow-y-auto touch-auto text-sm">
            {/* Floor 4 Diagnostic Debug Readout */}
            {currentFloor.id === 4 && (
              <div
                role="status"
                aria-label="Floor 4 Diagnostic Telemetry Readout"
                className="mx-3 mt-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/50 font-mono text-[11px] text-[#FFD166] flex items-center justify-between shadow-sm shrink-0">
                <span className="font-bold tracking-tight">
                  [F4 DEBUG] Agent: ({agentPos.col}, {agentPos.row}) | has_key: {hasKey ? 'TRUE' : 'FALSE'} | Door: {isDoorUnlocked ? 'UNLOCKED' : 'LOCKED'} | Last: {lastExecutedCommand}
                </span>
              </div>
            )}

            {/* 1. Simplified Right-Panel Gameplay Header */}
            <div className="px-3.5 py-2.5 bg-[#0B111E] border-b border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-[#4EFA8B] font-bold uppercase tracking-wider truncate">
                  Floor {currentFloor.floorNumber}: {currentFloor.title}
                </span>
                <span className="text-[11px] font-mono text-[#B497FF] font-bold bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 shrink-0">
                  Concept: {currentFloor.conceptTag}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Contextual Keycard Status Badge (Floors 4-5 only when relevant) */}
                {(currentFloor.id === 4 || currentFloor.id === 5) && currentFloor.keycards && currentFloor.keycards.length > 0 && (
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors flex items-center gap-1 ${
                      hasKeycard
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70'
                        : 'bg-slate-900 text-amber-300 border-amber-500/40'
                    }`}
                    title={hasKeycard ? 'Security Keycard acquired: Access granted to Security Door' : 'Security Keycard needed at B6'}>
                    <span>🔑</span>
                    <span>Keycard: {hasKeycard ? 'Acquired' : 'Needed'}</span>
                  </span>
                )}

                {/* Progressive Hints Button */}
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playCrispClick();
                    setIsHintModalOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={isHintModalOpen}
                  aria-label="View progressive tactical hints"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#FFD166] hover:text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                  <Lightbulb size={13} className="text-[#FFD166]" />
                  <span>💡 Hints</span>
                </button>

                {/* Objective Button */}
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playCrispClick();
                    setIsMissionBriefingOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={isMissionBriefingOpen}
                  aria-label="View mission briefing objective"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                  <TerminalIcon size={13} className="text-[#4EFA8B]" />
                  <span>Objective</span>
                </button>
              </div>
            </div>

              {/* Quick Start Compact Non-Displacing Inline Badge (Floor 1 only) */}
              {!isTourOpen &&
                currentFloor.id === 1 &&
                !hasTriedFirstMove &&
                !quickStartDismissed &&
                statusFeedback.state === 'idle' &&
                !isExecuting && (
                  <div
                    role="status"
                    className="mt-0.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-200 font-mono text-[11px] flex items-center justify-between gap-2 animate-fadeIn shrink-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="shrink-0">🎯</span>
                      <span className="truncate">
                        <strong className="text-[#FFD166]">Quick Start:</strong> Try <code className="text-[#4EFA8B] font-bold">move_right(2)</code>
                      </span>
                    </div>
                    <button
                      onClick={() => setQuickStartDismissed(true)}
                      title="Dismiss quick start prompt"
                      aria-label="Dismiss quick start prompt"
                      className="p-0.5 rounded text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                )}

              {/* Collapsible Subtle Shortcuts Tip Drawer */}
              {showShortcutsTip && (
                <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-1 shrink-0">
                  <span>
                    <kbd className="px-1 py-0.2 rounded bg-slate-800 text-[#4EFA8B] border border-slate-700 font-bold">Ctrl+Enter</kbd> Run &bull;{' '}
                    <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">Esc</kbd> Run Btn &bull;{' '}
                    <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">Tab</kbd> Focus &bull;{' '}
                    <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">R</kbd> Reset
                  </span>
                  <button
                    onClick={() => setShowShortcutsTip(false)}
                    className="text-slate-400 hover:text-white text-[10px] p-0.5">
                    ✕
                  </button>
                </div>
              )}

            {/* 2. Compact Command Chips row (Relocated directly ABOVE Python Editor) */}
            <div className="px-3 pt-2 shrink-0">
              <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-slate-300">Commands:</span>
                  {chipToast && (
                    <span
                      role="status"
                      aria-live="polite"
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/90 border border-emerald-500/60 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                      <Check size={10} />
                      <span>{chipToast.message}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {selectedFloorId === 2 && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertCommand('stride = 3')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#FFD166] text-xs font-mono font-bold border border-slate-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + stride = 3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCommand('move_right(stride)')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-slate-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + move_right(stride)
                      </button>
                    </>
                  )}
                  {selectedFloorId === 3 && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertCommand('for i in range(4):')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#B497FF] text-xs font-mono font-bold border border-purple-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + for i in range(4):
                      </button>
                    </>
                  )}
                  {selectedFloorId === 4 && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertCommand('if has_key:')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#B497FF] text-xs font-mono font-bold border border-purple-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + if has_key:
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCommand('unlock_door()')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-emerald-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + unlock_door()
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCommand('else:')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#FFD166] text-xs font-mono font-bold border border-amber-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + else:
                      </button>
                    </>
                  )}
                  {selectedFloorId === 5 && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertCommand('step = 1')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#FFD166] text-xs font-mono font-bold border border-amber-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + step = 1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCommand('if sensor_clear:')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#B497FF] text-xs font-mono font-bold border border-purple-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + if sensor_clear:
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCommand('for i in range(3):')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-emerald-500/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        + for i in range(3):
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => insertCommand('move_right(1)')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-slate-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                    + move_right(1)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertCommand('move_down(1)')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-slate-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                    + move_down(1)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertCommand('move_left(1)')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-slate-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                    + move_left(1)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertCommand('move_up(1)')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] text-xs font-mono font-bold border border-slate-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                    + move_up(1)
                  </button>
                </div>
              </div>
            </div>

            {/* 3. TALL, Dominant Python Editor & 4. Attached Execution Action Bar (~50-60% vertical workspace) */}
            <div
              data-tour="editor"
              className="flex-1 flex flex-col min-h-[340px] md:min-h-[420px] relative bg-slate-950/80 rounded-xl border border-slate-800 mx-3 my-2 overflow-hidden shadow-xl shrink-0 lg:shrink">
              {/* Editor Toolbar Header */}
              <div className="px-3 py-1.5 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono shrink-0">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Python 3.x Script</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span>{code.split('\n').length} lines</span>
                  <span>•</span>
                  <span className="text-slate-400">UTF-8</span>
                </div>
              </div>

              {/* Line numbers + Textarea Container with flexible internal scrolling */}
              <div className="flex-1 min-h-[220px] md:min-h-[300px] flex relative bg-[#070C16] font-mono text-xs overflow-hidden">
                {/* Line numbers gutter */}
                <div className="w-11 bg-slate-900/90 text-[#94A3B8] font-bold py-2.5 text-right pr-2 select-none border-r border-slate-800 shrink-0 font-mono">
                  {code.split('\n').map((_, i) => (
                    <div
                      key={i}
                      className={`leading-5 flex items-center justify-end gap-0.5 px-1 rounded transition-colors ${
                        errorLineIndex === i
                          ? 'bg-rose-600 text-white font-black ring-1 ring-rose-400'
                          : activeExecutingLine === i
                          ? 'text-[#4EFA8B] font-black bg-[#4EFA8B]/30'
                          : ''
                      }`}>
                      {errorLineIndex === i ? (
                        <span className="text-[10px]" aria-hidden="true">⚠️</span>
                      ) : null}
                      <span>{i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    cursorPositionRef.current = {
                      start: e.target.selectionStart,
                      end: e.target.selectionEnd,
                      hasUserFocused: true,
                    };
                    if (errorLineIndex !== null) {
                      setErrorLineIndex(null);
                    }
                  }}
                  onSelect={updateCursorPosition}
                  onClick={updateCursorPosition}
                  onKeyUp={updateCursorPosition}
                  onFocus={updateCursorPosition}
                  onKeyDown={handleEditorKeyDown}
                  onBlur={() => {
                    escapeToExitRef.current = false;
                  }}
                  spellCheck={false}
                  aria-label="Python Mission Infiltration Code Editor. Tab indents 4 spaces (Shift+Tab unindents). Press Escape then Tab to navigate focus to adjacent controls."
                  className="flex-1 bg-transparent text-[#F1F5F9] p-2.5 outline-none resize-none leading-5 font-mono selection:bg-purple-900/60 overflow-y-auto whitespace-pre placeholder:text-[#94A3B8] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
                  placeholder="# Program your infiltration commands here..."
                />
              </div>

              {/* 4. Attached Execution Action Bar immediately below the editor */}
              <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-slate-900/95 border-t border-slate-800 shrink-0 z-10">
                {/* Primary Hero Button: Run Code */}
                <button
                  ref={runBtnRef}
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  data-tour="run-btn"
                  data-testid="run-button"
                  className={`flex-1 py-3 px-5 rounded-lg font-bold text-sm sm:text-base font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isExecuting
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-1 ring-emerald-400'
                  }`}>
                  <Play size={18} fill="currentColor" />
                  <span>RUN CODE</span>
                </button>

                {/* Step */}
                <button
                  onClick={handleStepCode}
                  disabled={isExecuting && !isStepMode}
                  title="Single step debugger"
                  className="px-3.5 sm:px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 font-mono text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                  <SkipForward size={15} className="text-[#B497FF]" />
                  <span>STEP</span>
                </button>

                {/* Reset button with floating confirmation toast */}
                <div className="relative">
                  <button
                    onClick={handleResetSimulation}
                    title="Reset simulation to spawn (R)"
                    className="px-3.5 sm:px-4 py-3 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-semibold rounded-lg border border-slate-700 font-mono text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                    <RotateCw size={15} />
                    <span>RESET</span>
                  </button>

                  {/* FIX 2: Visible floating confirmation toast */}
                  {resetToast && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="absolute bottom-full right-0 mb-2 w-64 pointer-events-none z-30 transition-all duration-300 animate-fadeIn"
                      style={{
                        backgroundColor: '#0B111E',
                        border: '1.5px solid #4EFA8B',
                        boxShadow:
                          '0 8px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(78, 250, 139, 0.25)',
                        borderRadius: '0.75rem',
                        padding: '0.625rem 0.75rem',
                      }}>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4EFA8B] mt-1 shrink-0 animate-ping" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-bold text-xs text-[#4EFA8B] tracking-wide">
                            Simulation reset!
                          </div>
                          <div className="font-sans text-[11px] text-slate-200 leading-snug mt-0.5">
                            Agent returned to start. Python code preserved.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Speed toggle pill */}
                <button
                  onClick={() => {
                    const nextSpeed =
                      executionSpeed === 1
                        ? 2
                        : executionSpeed === 2
                        ? 'instant'
                        : 1;
                    setExecutionSpeed(nextSpeed);
                  }}
                  className="hidden sm:flex px-2.5 py-3 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-xs font-semibold items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title="Toggle animation speed">
                  <FastForward size={14} className="text-[#B497FF]" />
                  <span className="text-amber-300 font-bold">
                    {executionSpeed === 'instant' ? '⚡' : `${executionSpeed}x`}
                  </span>
                </button>
              </div>
            </div>

            {/* 5. Compact Contextual Status Area & 6. Collapsible Step Log & Telemetry */}
            <div className="px-3 pb-3 flex flex-col gap-2 shrink-0">
              {/* Single Contextual Feedback Alert */}
              {statusFeedback.state === 'running' && (
                <div
                  role="status"
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 flex items-start gap-2 text-xs font-mono shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#4EFA8B] animate-ping mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <strong className="block text-[#4EFA8B] font-bold text-xs uppercase tracking-wider">
                      {statusFeedback.title || 'Executing Code...'}
                    </strong>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed truncate">
                      {statusFeedback.body}
                    </p>
                  </div>
                </div>
              )}

              {statusFeedback.state === 'success' && (
                <div
                  role="status"
                  className="p-2.5 rounded-lg bg-emerald-950/80 border border-[#4EFA8B] text-emerald-100 flex items-start gap-2 text-xs font-mono shadow-md shrink-0">
                  <CheckCircle2 size={16} className="text-[#4EFA8B] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <strong className="block text-[#4EFA8B] font-bold text-xs uppercase tracking-wider">
                      {statusFeedback.title || 'Infiltration Confirmed!'}
                    </strong>
                    <p className="text-xs text-emerald-200 font-sans leading-relaxed">
                      {statusFeedback.body}
                    </p>
                    {statusFeedback.suggestion && (
                      <span className="block mt-0.5 text-[11px] text-[#FFD166] font-sans">
                        {statusFeedback.suggestion}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Encouraging Pedagogical Concept Validation Guidance (Amber/Lavender styling, zero rating penalties) */}
              {statusFeedback.state === 'concept_missing' && (
                <div
                  role="status"
                  className="p-3 rounded-xl bg-gradient-to-r from-amber-950/80 via-purple-950/70 to-slate-900 border-2 border-amber-400 text-amber-100 flex items-start gap-2.5 text-xs font-mono shadow-[0_0_24px_rgba(255,209,102,0.3)] shrink-0 animate-fadeIn">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-[#FFD166] shrink-0 mt-0.5">
                    <Lightbulb size={18} className="animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <strong className="text-[#FFD166] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span>{statusFeedback.title || 'Almost There, Agent!'}</span>
                      </strong>
                      <span className="text-[10px] font-mono text-[#B497FF] bg-purple-900/70 px-2 py-0.5 rounded border border-purple-400/50 font-bold shrink-0">
                        ZERO PENALTY
                      </span>
                    </div>
                    <p className="text-xs text-slate-100 font-sans leading-relaxed">
                      {statusFeedback.body}
                    </p>
                    {statusFeedback.suggestion && (
                      <div className="pt-1.5 border-t border-amber-500/30 text-[11px] text-amber-200 font-sans flex items-start gap-1">
                        <span className="text-[#B497FF] font-bold shrink-0">💡 Tip:</span>
                        <span>{statusFeedback.suggestion}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {statusFeedback.state === 'error' && (
                <div
                  role="alert"
                  className="p-2.5 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-100 flex items-start gap-2 text-xs font-mono shadow-md shrink-0">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <strong className="block text-rose-200 font-bold text-xs uppercase tracking-wider">
                      {statusFeedback.title}
                    </strong>
                    <p className="text-xs text-white font-sans leading-relaxed">
                      {statusFeedback.body}
                    </p>
                    {statusFeedback.suggestion && (
                      <div className="mt-1 pt-1 border-t border-rose-800/80 text-[11px] text-amber-300 font-sans">
                        💡 {statusFeedback.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {statusFeedback.state === 'idle' && (
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 flex items-center justify-between text-xs font-mono shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <TerminalIcon size={13} className="text-[#4EFA8B] shrink-0" />
                    <span className="text-slate-300 font-sans text-xs truncate">
                      {statusFeedback.body || 'Ready for code execution.'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 hidden sm:inline">
                    READY
                  </span>
                </div>
              )}

              {/* 6. Collapsible Step Log & Telemetry */}
              <details className="group border border-slate-800 rounded-lg p-1.5 bg-slate-950/40 shrink-0 font-mono text-xs">
                <summary className="flex items-center justify-between cursor-pointer text-[11px] text-slate-400 hover:text-slate-200 select-none px-1 py-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>Step Log & Telemetry</span>
                    <span className="text-[#FFD166]">({executionLogs.length} steps)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>

                <div
                  tabIndex={0}
                  role="region"
                  aria-label="Detailed Execution Step Log List"
                  className="mt-1.5 p-2 bg-[#070C16] rounded-lg border border-slate-800 max-h-32 overflow-y-auto space-y-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                  {executionLogs.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-1">
                      No steps recorded yet. Run code to populate telemetry.
                    </p>
                  ) : (
                    <ol className="divide-y divide-slate-800/80">
                      {executionLogs.map((log) => (
                        <li
                          key={log.id}
                          className="py-1 px-1 flex items-center justify-between gap-2 hover:bg-slate-800/40 rounded transition-colors">
                          <span className="text-slate-300">
                            <strong className="text-white">Step {log.stepNumber}</strong> (L{log.line}):{' '}
                            <span className="text-[#4EFA8B]">{log.direction}</span>
                          </span>
                          <span className="font-bold text-[#FFD166]">
                            {log.direction === 'unlock'
                              ? `${COL_LABELS[log.fromCol]}${ROW_LABELS[log.fromRow]}: UNLOCK DOOR at E4`
                              : `${COL_LABELS[log.fromCol]}${ROW_LABELS[log.fromRow]} \u2192 ${COL_LABELS[log.toCol]}${ROW_LABELS[log.toRow]}`}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              log.status === 'terminal'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                : log.status === 'ok'
                                ? log.direction === 'unlock'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                  : 'bg-slate-800 text-slate-200 border-slate-700'
                                : 'bg-rose-950 text-rose-300 border-rose-600'
                            }`}>
                            {log.status === 'terminal'
                              ? 'GOAL'
                              : log.status === 'ok'
                              ? log.direction === 'unlock'
                                ? 'UNLOCKED'
                                : 'MOVED'
                              : 'BLOCKED'}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </details>
            </div>
          </section>

          {/* Contextual Onboarding Walkthrough Overlay */}
          <OnboardingTour
            isOpen={isTourOpen}
            step={tourStep}
            onNext={() => {
              gameAudio.playCrispClick();
              if (tourStep < TOUR_STEPS.length - 1) {
                setTourStep((s) => s + 1);
              } else {
                try {
                  localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
                } catch (e) {
                  // ignore
                }
                setIsTourOpen(false);
                gameAudio.playPowerupChime();
              }
            }}
            onPrev={() => {
              gameAudio.playCrispClick();
              setTourStep((s) => Math.max(0, s - 1));
            }}
            onSkip={() => {
              gameAudio.playCrispClick();
              try {
                localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
              } catch (e) {
                // ignore
              }
              setIsTourOpen(false);
            }}
          />
        </main>
      )}

      {/* VIEW 5: MISSION DEBRIEF SCREEN ('debrief') */}
      {currentView === 'debrief' && (
        <section className="flex-1 w-full min-h-0 overflow-y-auto touch-auto p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 text-center font-mono">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-[#4EFA8B] flex items-center justify-center text-[#4EFA8B] shadow-xl shadow-emerald-500/30">
            <Check size={32} />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#B497FF] font-bold">
              {currentFloor.codename}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              MISSION COMPLETE
            </h2>
            <p className="text-xs text-slate-300">
              Floor {currentFloor.floorNumber}: {currentFloor.title} terminal
              mainframe decrypted!
            </p>
          </div>

          {/* Educational Concept Recap Card */}
          <div className="w-full bg-[#111827] border border-[#1F293D] p-5 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFD166]">
              <Sparkles size={16} />
              <span>PYTHON CONCEPT LEARNED:</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {currentFloor.conceptRecap}
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-[#111827] border border-[#1F293D] p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">
                Lines of Code Executed
              </span>
              <strong className="text-lg text-[#4EFA8B]">
                {code.split('\n').filter((l) => l.trim() && !l.startsWith('#'))
                  .length}
              </strong>
            </div>

            <div className="bg-[#111827] border border-[#1F293D] p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">
                Floor High Score
              </span>
              <strong className="text-lg text-[#FFD166]">
                {saveData.highScores[selectedFloorId] || gameState.score} pts
              </strong>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            {selectedFloorId < 5 &&
            saveData.unlockedFloors.includes(selectedFloorId + 1) ? (
              <button
                onClick={() => enterMission(selectedFloorId + 1)}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <span>START MISSION (FLOOR {selectedFloorId + 1})</span>
                <ChevronRight size={16} />
              </button>
            ) : null}

            {selectedFloorId === 5 && (
              <button
                onClick={() => {
                  gameAudio.playPowerupChime();
                  setIsMissionAccomplishedOpen(true);
                }}
                className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 active:scale-95 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <Award size={18} />
                <span>MISSION ACCOMPLISHED DOSSIER</span>
              </button>
            )}

            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setCurrentView('building');
              }}
              className="flex-1 py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs md:text-sm border border-slate-600 flex items-center justify-center gap-2 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <Layers size={16} className="text-[#B497FF]" />
              <span>FACILITY MAP</span>
            </button>
          </div>
        </section>
      )}

      {/* MODAL: LOCKED DOSSIER / SECURITY CLEARANCE PREVIEW */}
      {lockedDossierFloor && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div className="w-full max-w-md bg-[#111827] border-2 border-slate-700 rounded-2xl p-6 m-4 shadow-2xl text-left font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D] mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock size={18} />
                <span className="font-bold text-sm tracking-wider">
                  SECURITY CLEARANCE LEVEL {lockedDossierFloor.floorNumber} REQUIRED
                </span>
              </div>
              <button
                onClick={() => setLockedDossierFloor(null)}
                aria-label="Close Locked Dossier"
                className="p-1 rounded text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold">
                  Target Sector
                </span>
                <h4 className="text-lg font-black text-white">
                  Floor {lockedDossierFloor.floorNumber}:{' '}
                  {lockedDossierFloor.title}
                </h4>
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                {lockedDossierFloor.intelDossier}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <strong>Unlock Condition:</strong> Complete Floor{' '}
                {lockedDossierFloor.floorNumber - 1} to unlock clearance for this wing.
              </div>
            </div>

            <button
              onClick={() => setLockedDossierFloor(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              ACKNOWLEDGE INTEL (ESC)
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* MODAL: PROGRESSIVE HINTS MODAL (3 PROGRESSIVE TIERS) */}
      <ProgressiveHintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        floor={currentFloor}
        unlockedLevel={unlockedHintLevels[currentFloor.floorNumber] || 1}
        onUnlockNext={() => {
          gameAudio.playPowerupChime();
          setUnlockedHintLevels((prev) => ({
            ...prev,
            [currentFloor.floorNumber]: Math.min(3, (prev[currentFloor.floorNumber] || 1) + 1),
          }));
        }}
      />

      {/* MODAL: MISSION BRIEFING MODAL */}
      <MissionBriefingModal
        isOpen={isMissionBriefingOpen}
        onClose={handleDismissBriefing}
        floor={currentFloor}
      />

      {/* MODAL: PHYSICAL GAMEPLAY MECHANIC BRIEFING MODAL (FLOORS 3–5) */}
      {isMechanicBriefingOpen && MECHANIC_INTEL_CONFIGS[currentFloor.id] && (
        <MechanicBriefingModal
          isOpen={isMechanicBriefingOpen}
          onClose={handleDismissMechanicBriefing}
          config={MECHANIC_INTEL_CONFIGS[currentFloor.id]}
        />
      )}

      {/* MODAL: MISSION COMPROMISED — CAMERA DETECTED */}
      <CameraCompromisedModal
        isOpen={isCameraCompromised && !isReviewingFailedCode}
        tile={compromisedCameraTile || undefined}
        onReviewCode={() => {
          gameAudio.playCrispClick();
          setIsReviewingFailedCode(true);
        }}
        onRestart={handleRestartMissionCompromised}
      />

      {/* MODAL: FAILED SCRIPT REVIEW (POST-MORTEM ANALYSIS) */}
      <FailedCodeReviewModal
        isOpen={isReviewingFailedCode}
        code={failedCodeSnapshot}
        onClose={() => {
          gameAudio.playCrispClick();
          setIsReviewingFailedCode(false);
        }}
        onRestart={handleRestartMissionCompromised}
      />

      {/* MODAL: FACILITY GRID INTEL (LEVEL LAYOUT INSPECTOR) */}
      <FacilityGridIntelModal
        isOpen={isGridIntelOpen}
        onClose={() => setIsGridIntelOpen(false)}
        floor={currentFloor}
        onSelectCoord={(coord) => {
          setInspectedCell(coord);
          setLiveAnnouncement(
            `Inspecting grid coordinate ${COL_LABELS[coord.col]}${ROW_LABELS[coord.row]}.`,
          );
        }}
      />

      {/* MODAL: FIELD GUIDE / HOW TO PLAY */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div className="w-full max-w-lg bg-[#111827] border-2 border-[#4EFA8B]/60 rounded-2xl p-6 m-4 shadow-2xl flex flex-col font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D] mb-4">
              <div className="flex items-center gap-2 text-[#4EFA8B]">
                <BookOpen size={20} />
                <h3 className="font-bold text-base text-white">
                  OPERATIVE FIELD GUIDE
                </h3>
              </div>
              <button
                onClick={() => setIsHowToPlayOpen(false)}
                aria-label="Close Field Guide"
                className="p-1 rounded text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200 leading-relaxed mb-6 font-mono text-left max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-[#4EFA8B] block mb-1">
                  1. MISSION OBJECTIVE:
                </strong>
                Guide agent Cipher to the Mainframe Terminal on each floor using
                valid Python commands. Reach the Floor 5 Vault to retrieve the
                Top Secret Python Manual.
              </div>

              {/* Movement Directions Clarification & Cardinal Compass */}
              <div className="p-3 bg-[#0B111E] rounded-xl border border-emerald-500/40 space-y-2">
                <strong className="text-[#4EFA8B] block">
                  2. SCREEN-RELATIVE MOVEMENT & CARDINAL DIRECTIONS:
                </strong>
                <p className="text-slate-300 text-xs">
                  All movement commands are strictly <strong className="text-white">screen-relative (cardinal/grid-relative)</strong>, regardless of which direction Agent Cipher is visually facing:
                </p>
                {/* Visual / Textual Compass Diagram */}
                <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80 font-mono text-[11px] text-[#FFD166] text-center font-bold">
                  ▲ move_up | ▼ move_down | ◀ move_left | ▶ move_right
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-200 text-xs pl-1">
                  <li>
                    <code className="text-[#4EFA8B] font-bold">move_up(n)</code> ALWAYS moves Agent Cipher toward the <strong className="text-white">TOP</strong> of the game screen (North), regardless of which direction the agent is visually facing.
                  </li>
                  <li>
                    <code className="text-[#4EFA8B] font-bold">move_down(n)</code> moves toward the <strong className="text-white">BOTTOM</strong> of the screen (South).
                  </li>
                  <li>
                    <code className="text-[#4EFA8B] font-bold">move_left(n)</code> moves toward the <strong className="text-white">LEFT</strong> (West).
                  </li>
                  <li>
                    <code className="text-[#4EFA8B] font-bold">move_right(n)</code> moves toward the <strong className="text-white">RIGHT</strong> (East).
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-[#B497FF] block mb-1">
                  3. FUNCTIONS & SEQUENCING (FLOOR 1):
                </strong>
                Instructions execute top-to-bottom in order. Line 1 always finishes fully before Line 2 starts.
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-[#FFD166] block mb-1">
                  4. VARIABLES & ARGUMENTS (FLOOR 2):
                </strong>
                Assign numbers to named containers and pass them as arguments to movement calls:
                <code className="block text-amber-300 mt-1 font-bold">
                  stride = 3{'\n'}move_right(stride)
                </code>
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-[#4EFA8B] block mb-1">
                  5. FOR LOOPS & ITERATION (FLOOR 3):
                </strong>
                Automate repeating steps using range(count). Indent the commands underneath:
                <code className="block text-emerald-300 mt-1 font-bold">
                  for i in range(4):{'\n'}    move_right(1){'\n'}    move_down(1)
                </code>
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-[#B497FF] block mb-1">
                  6. CONDITIONALS & TELEMETRY (FLOOR 4):
                </strong>
                Evaluate game state before taking risks using if statements:
                <code className="block text-purple-300 mt-1 font-bold">
                  if sensor_clear:{'\n'}    move_right(5)
                </code>
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-[#FFD166] block mb-1">
                  7. APEX SYNTHESIS (FLOOR 5):
                </strong>
                Combine variables, loops, and conditionals into a master script to unlock the Supreme Vault!
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-rose-400 block mb-1">
                  8. HAZARD EVASION & SYMBOLS:
                </strong>
                Avoid solid steel partitions [🛡️ BARRIER] and active lavender laser emitters [⚠️ DANGER LASER].
                Check the holographic path projection preview before executing!
              </div>

              <div className="p-3 bg-[#0B111E] rounded-xl border border-slate-800">
                <strong className="text-blue-300 block mb-1">
                  9. ACCESSIBILITY & SHORTCUTS:
                </strong>
                Press <code>Ctrl+Enter</code> to Run Code, <code>R</code> to Reset simulation, <code>Escape</code> in editor jumps to Run Code. Press <code>Tab</code> in editor to advance focus to Run button. Speed toggle supports <code>Instant (Reduced Motion)</code>.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsHowToPlayOpen(false);
                setIsGridIntelOpen(true);
              }}
              className="w-full py-2.5 mb-2 bg-slate-800 hover:bg-slate-700 text-[#4EFA8B] border border-emerald-500/50 rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <Info size={15} />
              <span>INSPECT FACILITY GRID INTEL (LEVEL LAYOUT)</span>
            </button>

            <button
              onClick={() => {
                setIsHowToPlayOpen(false);
                setTourStep(0);
                setIsTourOpen(true);
              }}
              className="w-full py-2.5 mb-2 bg-slate-800 hover:bg-slate-700 text-[#FFD166] border border-amber-500/50 rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <HelpCircle size={15} />
              <span>REPLAY ONBOARDING WALKTHROUGH</span>
            </button>

            <button
              onClick={() => setIsHowToPlayOpen(false)}
              className="w-full py-3 bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              CLOSE FIELD GUIDE (ESC)
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* MODAL: GAMEPLAY MENU (Esc) */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-md bg-[#111827] border-2 border-slate-700 rounded-2xl p-6 m-4 shadow-2xl flex flex-col items-center font-mono">
            <h2 className="text-2xl font-black mb-6 text-[#4EFA8B] tracking-wide">
              SECURITY PAUSE
            </h2>

            <div className="w-full flex flex-col gap-3 mb-6 text-sm">
              <button
                autoFocus
                onClick={() => setIsGameMenuOpen(false)}
                className="w-full py-3 bg-[#4EFA8B] hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <Play size={18} fill="currentColor" />
                <span>RESUME MISSION</span>
              </button>

              <button
                onClick={() => {
                  handleResetSimulation();
                  setIsGameMenuOpen(false);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <RotateCw size={16} />
                <span>RESET SIMULATION (R)</span>
              </button>

              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  handleReplayMission(selectedFloorId);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-[#FFD166] rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <RotateCw size={16} className="text-[#FFD166]" />
                <span>REPLAY MISSION (FRESH ATTEMPT)</span>
              </button>

              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  setCurrentView('building');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <Layers size={16} className="text-[#B497FF]" />
                <span>FACILITY MAP</span>
              </button>

              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  setCurrentView('home');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <ArrowLeft size={16} />
                <span>EXIT TO HQ</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Press Escape or tap outside to resume
            </p>
          </div>
        </MenuOverlay>
      )}

      {/* MODAL: MISSION ACCOMPLISHED (FINAL VICTORY SCREEN) */}
      <MissionAccomplishedModal
        isOpen={isMissionAccomplishedOpen}
        saveData={saveData}
        onReplayFloor5={() => {
          setIsMissionAccomplishedOpen(false);
          handleReplayMission(5);
        }}
        onReturnToMap={() => {
          setIsMissionAccomplishedOpen(false);
          setCurrentView('building');
        }}
      />
    </div>
  );
}
