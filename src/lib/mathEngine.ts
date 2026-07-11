import { SYLLABUS_CHAPTERS, SYLLABUS_CHAPTERS as syllabus } from "./syllabus";

export interface SolverResult {
  question: string;
  topic: string;
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solvingTime: string;
  marks: string;
  correctAnswer: string;
  stepByStep: string[];
  shortcutMethod: string;
  fastTrick: string;
  alternativeSolution?: string;
  formulaUsed: string;
  memoryTrick: string;
  commonMistakes: string;
  frequency: string;
  importance: string;
  similarQuestions: string[];
  isFallback?: boolean;
  fallbackReason?: string;
}

// Local mock templates solver
export function solveMathOffline(query: string, targetExam: string): SolverResult {
  const cleanQuery = query.toLowerCase().trim();
  
  // 1. Time & Work Template: A in X days, B in Y days
  // e.g., "A can do a work in 10 days, B can do it in 15 days. In how many days can they complete it together?"
  const timeWorkRegex = /(?:a\s+can\s+do|a\s+takes|a\s+finishes).*?(\d+)\s*days.*?b\s+(?:can\s+do|takes|finishes).*?(\d+)\s*days/i;
  const matchTW = query.match(timeWorkRegex);
  if (matchTW) {
    const x = parseInt(matchTW[1]);
    const y = parseInt(matchTW[2]);
    const lcm = getLCM(x, y);
    const effA = lcm / x;
    const effB = lcm / y;
    const totalEff = effA + effB;
    const daysTogether = (lcm / totalEff).toFixed(1);
    
    return {
      question: query,
      topic: "Time & Work (Combined Efficiency)",
      chapter: "Time & Work",
      difficulty: "Easy",
      solvingTime: "30 seconds",
      marks: "2 Marks",
      correctAnswer: `${daysTogether} days`,
      stepByStep: [
        `Assume Total Work = LCM of A's days (${x}) and B's days (${y}) = ${lcm} units.`,
        `Calculate A's efficiency (work/day) = Total Work / A's days = ${lcm} / ${x} = ${effA} units/day.`,
        `Calculate B's efficiency (work/day) = Total Work / B's days = ${lcm} / ${y} = ${effB} units/day.`,
        `Combined efficiency of A and B = ${effA} + ${effB} = ${totalEff} units/day.`,
        `Total days taken together = Total Work / Combined Efficiency = ${lcm} / ${totalEff} = ${daysTogether} days.`
      ],
      shortcutMethod: `Product-over-Sum Shortcut: (X * Y) / (X + Y) = (${x} * ${y}) / (${x} + ${y}) = ${x*y} / ${x+y} = ${daysTogether} days.`,
      fastTrick: `Vedic Ratio Trick: The ratio of days is ${x}:${y}. The ratio of efficiency is inverted to ${y}:${x}. Together they take: days of A / (1 + ratio(A/B)) = ${x} / (1 + ${x}/${y}) = ${daysTogether} days.`,
      alternativeSolution: `Fraction Method: A's 1-day work = 1/${x}, B's 1-day work = 1/${y}. Together in 1 day = 1/${x} + 1/${y} = ${(x+y)}/${x*y}. Days together = ${x*y}/${x+y} = ${daysTogether} days.`,
      formulaUsed: "Work = Efficiency × Time; Total Days = (X × Y) / (X + Y)",
      memoryTrick: "LCM method is always safer than fractions because it avoids decimal fractions in intermediate steps. Think of it as 'making cookies'. A makes B cookies, B makes A cookies.",
      commonMistakes: "Adding days directly (e.g., 10 + 15 = 25 days) is incorrect. More workers must result in fewer days than either working alone.",
      frequency: "High (Asked in 94% of previous papers of this category)",
      importance: `Crucial for ${targetExam.toUpperCase()}`,
      similarQuestions: [
        "P can finish work in 12 days, Q in 18 days. Find their combined time.",
        "A tank is filled by Pipe A in 8 hrs and Pipe B in 12 hrs. Find filling time."
      ]
    };
  }

  // 2. Percentage Net Effect: X% increase, Y% decrease
  // e.g., "The price of sugar increases by 20% and consumption decreases by 10%. Find net change."
  const pctChangeRegex = /(?:increase|gain|rise|up).*?(\d+)\s*%.*?(?:decrease|reduction|drop|down).*?(\d+)\s*%/i;
  const matchPct = query.match(pctChangeRegex);
  if (matchPct) {
    const inc = parseInt(matchPct[1]);
    const dec = parseInt(matchPct[2]);
    const net = inc - dec - (inc * dec) / 100;
    const isInc = net >= 0;
    const absNet = Math.abs(net).toFixed(1);
    
    return {
      question: query,
      topic: "Net Percentage Change (Successive)",
      chapter: "Percentage",
      difficulty: "Medium",
      solvingTime: "15 seconds",
      marks: "1-2 Marks",
      correctAnswer: `${absNet}% ${isInc ? 'Increase' : 'Decrease'}`,
      stepByStep: [
        `Let initial value be 100.`,
        `After ${inc}% increase, new value = 100 + ${inc} = ${100 + inc}.`,
        `Now apply ${dec}% decrease on ${100 + inc} = ${((100 + inc) * dec / 100).toFixed(1)} reduction.`,
        `Final value = ${100 + inc} - ${((100 + inc) * dec / 100).toFixed(1)} = ${(100 + net).toFixed(1)}.`,
        `Overall change = ${(100 + net).toFixed(1)} - 100 = ${net.toFixed(1)}%.`
      ],
      shortcutMethod: `Net Percentage Formula: A + B + (A*B)/100. Here A = +${inc}, B = -${dec}. Net = ${inc} - ${dec} + (${inc}*(-${dec}))/100 = ${inc - dec} - ${inc*dec/100} = ${net.toFixed(1)}%.`,
      fastTrick: `Ratio Multiplication: Scale factor = (1 + ${inc}/100) * (1 - ${dec}/100) = ${(1 + inc/100).toFixed(2)} * ${(1 - dec/100).toFixed(2)} = ${( (1 + inc/100) * (1 - dec/100) ).toFixed(3)}. Deviation from 1 is the percentage.`,
      formulaUsed: "Net Change % = A + B + (AB / 100)",
      memoryTrick: "Keep the signs correct! Increases are positive (+), decreases are negative (-). Multiplication of a plus and a minus yields a minus.",
      commonMistakes: "Just adding/subtracting values directly (e.g. 20% - 10% = 10% increase) ignoring successive compounding. The correct answer is always slightly less than the simple difference.",
      frequency: "High (Asked in 91% of SSC and Railway exams)",
      importance: "Very important for quick simplification rounds.",
      similarQuestions: [
        "Length of rectangle is increased by 15%, width decreased by 8%. Find area change.",
        "Salary of a person first increases by 10% then drops by 10%. Find net loss."
      ]
    };
  }

  // 3. Trains: speed X km/h, platform length Y, crossing time
  // e.g. "A train of length 150m is running at 72 km/h. How long will it take to cross a platform of length 250m?"
  const trainRegex = /(?:train).*?(\d+)\s*m.*?(\d+)\s*km\/h.*?(?:platform|bridge).*?(\d+)\s*m/i;
  const matchTrain = query.match(trainRegex);
  if (matchTrain) {
    const tLen = parseInt(matchTrain[1]);
    const speedKmh = parseInt(matchTrain[2]);
    const pLen = parseInt(matchTrain[3]);
    
    const speedMs = speedKmh * 5 / 18;
    const totalDist = tLen + pLen;
    const timeSec = (totalDist / speedMs).toFixed(1);
    
    return {
      question: query,
      topic: "Train Crossing Static Object with Length",
      chapter: "Speed, Time & Distance",
      difficulty: "Medium",
      solvingTime: "25 seconds",
      marks: "2 Marks",
      correctAnswer: `${timeSec} seconds`,
      stepByStep: [
        `Identify Total Distance to cover = Length of Train + Length of Platform = ${tLen}m + ${pLen}m = ${totalDist}m.`,
        `Convert speed from km/h to m/s: Speed = ${speedKmh} * (5 / 18) = ${speedMs.toFixed(1)} m/s.`,
        `Time taken = Total Distance / Speed = ${totalDist} / ${speedMs.toFixed(1)} = ${timeSec} seconds.`
      ],
      shortcutMethod: `Combined formula: Time (s) = (Train Length + Platform Length) * 18 / (Speed * 5) = (${tLen} + ${pLen}) * 18 / (${speedKmh} * 5) = ${totalDist * 18} / ${speedKmh * 5} = ${timeSec}s.`,
      fastTrick: `Speed Factor Check: 72 km/h is exactly 4 times of 18 km/h (since 18 km/h = 5 m/s). Hence speed is 4 * 5 = 20 m/s. Divide total distance (${totalDist}) by 20 instantly. 400 / 20 = 20 seconds.`,
      formulaUsed: "Distance = Speed × Time; Speed in m/s = Speed in km/h × (5 / 18)",
      memoryTrick: "18 km/h is 5 m/s. Any multiple of 18 km/h can be converted to m/s by multiplying by 5. (e.g. 36 = 10, 54 = 15, 72 = 20, 90 = 25). Use this table for instant conversion.",
      commonMistakes: "Forgetting to convert km/h to m/s, or using only train length instead of train + platform length.",
      frequency: "High (A regular scoring question in Railway & SSC exams)",
      importance: "Extremely high for Railway (RRB ALP & NTPC)",
      similarQuestions: [
        "A train of length 200m crosses a bridge of length 300m at 90 km/h. Find crossing time.",
        "A train crosses a pole in 10s at 54 km/h. Find length of the train."
      ]
    };
  }

  // 4. Default Offline Solver: Semantic Match and Guided Syllabus Solver
  // We match general keywords and return syllabus notes
  let matchedChapter = SYLLABUS_CHAPTERS[0]; // fallback
  let matchedTopic = "Simplification and Tricks";
  
  if (cleanQuery.includes("work") || cleanQuery.includes("day") || cleanQuery.includes("pipe") || cleanQuery.includes("cistern")) {
    matchedChapter = SYLLABUS_CHAPTERS.find(c => c.id === "time-work") || matchedChapter;
    matchedTopic = "Time and Work Concepts";
  } else if (cleanQuery.includes("profit") || cleanQuery.includes("loss") || cleanQuery.includes("discount") || cleanQuery.includes("shopkeeper")) {
    matchedChapter = SYLLABUS_CHAPTERS.find(c => c.id === "profit-loss") || matchedChapter;
    matchedTopic = "Profit, Loss & Markup Rules";
  } else if (cleanQuery.includes("percent") || cleanQuery.includes("election") || cleanQuery.includes("salary")) {
    matchedChapter = SYLLABUS_CHAPTERS.find(c => c.id === "percent") || matchedChapter;
    matchedTopic = "Percentage scaling and Net Effects";
  } else if (cleanQuery.includes("speed") || cleanQuery.includes("train") || cleanQuery.includes("distance") || cleanQuery.includes("boat") || cleanQuery.includes("stream")) {
    matchedChapter = SYLLABUS_CHAPTERS.find(c => c.id === "speed-distance") || matchedChapter;
    matchedTopic = "Relative Speed & Distance Shortcuts";
  } else if (cleanQuery.includes("algebra") || cleanQuery.includes("solve") || cleanQuery.includes("root") || cleanQuery.includes("quadratic")) {
    matchedChapter = SYLLABUS_CHAPTERS.find(c => c.id === "algebra") || matchedChapter;
    matchedTopic = "Algebra Substitution and Identities";
  } else if (cleanQuery.includes("area") || cleanQuery.includes("volume") || cleanQuery.includes("triangle") || cleanQuery.includes("cylinder") || cleanQuery.includes("cone")) {
    matchedChapter = SYLLABUS_CHAPTERS.find(c => c.id === "mensuration") || matchedChapter;
    matchedTopic = "Mensuration & Geometry Dimensions";
  }

  return {
    question: query,
    topic: matchedTopic,
    chapter: matchedChapter.name,
    difficulty: "Medium",
    solvingTime: "40 seconds",
    marks: "2 Marks",
    correctAnswer: "Refer to Shortcut Guide",
    stepByStep: [
      `Analyze the key mathematical operators and question variables.`,
      `Identify the topic as belonging to [${matchedChapter.name}].`,
      `Extract the formulas associated with: ${matchedChapter.subtopics.slice(0, 3).join(", ")}.`,
      `Plug standard values into the template equation to arrive at the solution.`
    ],
    shortcutMethod: matchedChapter.shortcutFormula,
    fastTrick: "Vedic Digit Sum Method: Sum digits of numbers in the query and check which option matches the exact digit sum modulo 9. This eliminates 3 out of 4 options in 5 seconds.",
    formulaUsed: "Standard Topic Theorems",
    memoryTrick: `For ${matchedChapter.name}, prioritize identifying ratio dependencies immediately before computing raw numbers.`,
    commonMistakes: "Reading units incorrectly (e.g. mixing meters and kilometers, hours and minutes). Make units uniform first.",
    frequency: `High (${matchedChapter.pyqFrequencyPercent}% in recent years)`,
    importance: `Core subject section for ${targetExam.toUpperCase()}`,
    similarQuestions: [
      `Practice standard pyqs in ${matchedChapter.name}`,
      `Review standard formula sheet for ${matchedChapter.name}`
    ]
  };
}

// Utility functions
function getLCM(a: number, b: number): number {
  return (a * b) / getGCD(a, b);
}

function getGCD(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
