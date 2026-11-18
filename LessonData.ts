export interface LessonModule {
  floorId: number;
  floorTitle: string;
  concept: string;
  badge: string;
  introduction: string;
  codeExample: string[];
  explanation: {
    line: string;
    desc: string;
  }[];
  practiceInstructions: string;
  expectedOutcome: string;
}

export const LESSON_MODULES: Record<number, LessonModule> = {
  1: {
    floorId: 1,
    floorTitle: 'Floor 1: Entry Point',
    concept: 'Sequencing and Functions',
    badge: 'SEQUENCING',
    introduction:
      'In Python, commands are executed strictly in order from top to bottom. Each movement instruction is a function call. The integer passed inside the parentheses tells Agent Cipher how many grid units to travel before the next command begins.',
    codeExample: [
      '# Top-to-bottom sequence',
      'move_right(3)  # Step 1: Advance 3 cells East',
      'move_down(2)   # Step 2: Advance 2 cells South',
      'move_right(1)  # Step 3: Advance 1 cell East',
    ],
    explanation: [
      {
        line: 'move_right(3)',
        desc: 'Python evaluates this first. Agent Cipher moves 3 tiles to the right. Line 2 will not execute until this movement completely finishes.',
      },
      {
        line: 'move_down(2)',
        desc: 'Executes second. Changes direction to down and moves 2 tiles South.',
      },
      {
        line: 'move_right(1)',
        desc: 'Executes third. Moves 1 final tile to reach the target terminal.',
      },
    ],
    practiceInstructions:
      'Use the Command Sequencer to adjust step numbers (+/-), reorder instructions (▲/▼), or add lines. Press "Test Sequence Run" to observe how line order determines the path.',
    expectedOutcome:
      'Mastered: Every command executes in strict sequential order. Swapping instructions completely alters the trajectory.',
  },
  2: {
    floorId: 2,
    floorTitle: 'Floor 2: Access Control',
    concept: 'Variables and Arguments',
    badge: 'VARIABLES',
    introduction:
      'A variable is a named container that stores data. Instead of hardcoding numbers into multiple commands, assign a number to a descriptive variable name (e.g. stride = 3) and pass it as an argument into your movement functions.',
    codeExample: [
      '# Store distance in a variable',
      'stride = 3',
      'move_down(stride)   # Uses stride (3 cells)',
      'move_right(stride)  # Reuses stride (3 cells)',
    ],
    explanation: [
      {
        line: 'stride = 3',
        desc: 'Allocates the variable stride and assigns it the numeric value 3.',
      },
      {
        line: 'move_down(stride)',
        desc: 'Python resolves stride to 3, evaluating the function call as move_down(3).',
      },
      {
        line: 'move_right(stride)',
        desc: 'Reuses the same stride value (3). Changing stride = 4 at the top automatically updates both movements!',
      },
    ],
    practiceInstructions:
      'Adjust the variable value for stride using the selector buttons. Observe how the real-time preview and mini-grid scale both movement phases simultaneously.',
    expectedOutcome:
      'Mastered: Variables allow clean parameter reuse. Changing one assignment updates all commands referencing that variable.',
  },
  3: {
    floorId: 3,
    floorTitle: 'Floor 3: Surveillance',
    concept: 'For Loops & Timed Patrols',
    badge: 'FOR LOOPS',
    introduction:
      "Writing the same command repeatedly is inefficient and prone to error. A for loop automates repetitive actions over a specified number of cycles using range(count). When dealing with timed hazards like surveillance cameras, use wait(n) to keep Agent Cipher in place for n ticks while the camera continues its predictable patrol cycle.",
    codeExample: [
      '# Repeat movement and time camera sweeps',
      'for i in range(2):',
      '    move_right(1)  # Step forward',
      '    wait(1)        # Pause while camera turns',
    ],
    explanation: [
      {
        line: 'for i in range(2):',
        desc: 'Repeats the indented commands twice without duplicating lines.',
      },
      {
        line: '    move_right(1)',
        desc: 'Advances Agent Cipher 1 cell toward the objective on each cycle.',
      },
      {
        line: '    wait(1)',
        desc: 'Pauses Cipher safely in place for 1 tick while the surveillance camera continues its patrol sweep.',
      },
    ],
    practiceInstructions:
      'Select the loop count repeat. Press "Test Loop Run" to see the loop execute iteration-by-iteration without duplicated code.',
    expectedOutcome:
      'Mastered: For loops repeat code blocks effortlessly, while wait(n) provides essential timing control past camera patrols.',
  },
  4: {
    floorId: 4,
    floorTitle: 'Floor 4: Access Control',
    concept: 'Booleans and Conditional Statements',
    badge: 'BOOLEANS & CONDITIONALS',
    introduction:
      'In Python, a Boolean is a fundamental data type with only two possible values: True and False (always capitalized). Conditional \'if\' statements evaluate whether a condition or Boolean variable is True before executing an indented block of code. In this mission, the security variable \'has_key\' starts as False at mission spawn. When Agent Cipher physically steps onto the keycard tile at B6, the system updates \'has_key\' to True. To open the electronic security door at E4, Cipher must be at the door terminal at D4 and execute \'if has_key:\' to unlock the bulkhead.',
    codeExample: [
      '# Booleans are either True or False',
      '# has_key starts False; becomes True at B6',
      'if has_key:',
      '    unlock_door()  # Runs if has_key is True',
      'else:',
      '    print("Find the keycard first.")',
    ],
    explanation: [
      {
        line: 'has_key (Boolean Variable)',
        desc: 'A Boolean variable has only two values: True or False (capitalized in Python). At mission start has_key is False. Stepping on B6 updates it to True.',
      },
      {
        line: 'if has_key:',
        desc: 'Evaluates the condition. If has_key is True, Python executes the indented block. Note the required colon (:) at the end of the line.',
      },
      {
        line: '    unlock_door()',
        desc: 'Indented by 4 spaces. Unlocks the reinforced electronic security door at E4 when Agent Cipher is at the door terminal (D4).',
      },
      {
        line: 'else:',
        desc: 'An optional fallback branch that only executes if the condition evaluated to False. Also followed by a colon and indented block.',
      },
    ],
    practiceInstructions:
      'Toggle the has_key Boolean status between False (Mission Start) and True (Acquired at B6). Press "Test Branch Run" to observe how Python evaluates the condition, which branch executes, and whether the door unlocks.',
    expectedOutcome:
      'Mastered: Booleans (True/False) paired with conditional if/else statements control program execution branches based on live inventory state.',
  },
  5: {
    floorId: 5,
    floorTitle: 'Floor 5: The Vault',
    concept: 'Combined Systems Architecture',
    badge: 'SYNTHESIS',
    introduction:
      'The Apex Vault requires synthesizing all computational concepts: combining Variables, Sequencing, For Loops, and Conditionals into an elegant, scalable automated infiltration script.',
    codeExample: [
      '# Synthesizing variables & loop iterations',
      'cycles = 3',
      'step_size = 1',
      '',
      'for i in range(cycles):',
      '    move_right(step_size)',
      '    move_down(step_size)',
    ],
    explanation: [
      {
        line: 'cycles = 3, step_size = 1',
        desc: 'Defines configuration variables at the script head for easy tuning.',
      },
      {
        line: 'for i in range(cycles):',
        desc: 'Loops over the defined cycle count, automating a stepped staircase pattern.',
      },
      {
        line: '    move_right(...); move_down(...)',
        desc: 'Executes the sequenced multi-directional navigation steps on each loop iteration to reach the Supreme Vault.',
      },
    ],
    practiceInstructions:
      'Tune the variable parameters cycles and step_size. Run the synthesis sandbox to witness automated multi-step traversal across complex partitioned security chambers.',
    expectedOutcome:
      'Mastered: High-level programming combines variables, loops, and sequencing to solve complex navigational challenges with minimal code.',
  },
};
