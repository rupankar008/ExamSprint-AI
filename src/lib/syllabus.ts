export interface ExamConfig {
  id: string;
  name: string;
  category: 'railway' | 'police' | 'ssc' | 'banking' | 'defence' | 'wb';
  theme: 'railway' | 'police' | 'ssc' | 'banking' | 'defence';
  durationMinutes: number;
  totalQuestions: number;
  markingRule: {
    correct: number;
    incorrect: number; // Negative marking
  };
  shortcutsPhilosophy: string;
}

export interface SyllabusChapter {
  id: string;
  name: string;
  subtopics: string[];
  importance: 'High' | 'Medium' | 'Low';
  pyqFrequencyPercent: number; // Percent frequency in past 5 years
  shortcutFormula: string;
}

export const EXAM_LIST: ExamConfig[] = [
  {
    id: "rrb-alp",
    name: "RRB ALP & Technician",
    category: "railway",
    theme: "railway",
    durationMinutes: 60,
    totalQuestions: 75,
    markingRule: { correct: 1, incorrect: -0.33 },
    shortcutsPhilosophy: "Locomotive Speed Tricks, Vedic Division, Mensuration Unit Digital Sums."
  },
  {
    id: "rrb-ntpc",
    name: "RRB NTPC CBT-1",
    category: "railway",
    theme: "railway",
    durationMinutes: 90,
    totalQuestions: 100,
    markingRule: { correct: 1, incorrect: -0.33 },
    shortcutsPhilosophy: "Fast Ratio balancing, Work & Time chain formulas, Railway speed calculations."
  },
  {
    id: "wb-police-constable",
    name: "West Bengal Police Constable",
    category: "police",
    theme: "police",
    durationMinutes: 60,
    totalQuestions: 85,
    markingRule: { correct: 1, incorrect: -0.25 },
    shortcutsPhilosophy: "Simplified Bengali step breakdowns, Quick Percentage tricks, Basic mental maths."
  },
  {
    id: "wbpsc-food-si",
    name: "WBPSC Food SI",
    category: "wb",
    theme: "police",
    durationMinutes: 90,
    totalQuestions: 100,
    markingRule: { correct: 1, incorrect: -0.33 },
    shortcutsPhilosophy: "Profit & Loss direct formula shortcuts, Partnership ratios, Simple interest tricks."
  },
  {
    id: "ssc-cgl",
    name: "SSC CGL Tier-1",
    category: "ssc",
    theme: "ssc",
    durationMinutes: 60,
    totalQuestions: 100,
    markingRule: { correct: 2, incorrect: -0.5 },
    shortcutsPhilosophy: "Advanced Algebra value substitution, Geometry option elimination, Trigonometry height ratios."
  },
  {
    id: "ssc-chsl",
    name: "SSC CHSL Tier-1",
    category: "ssc",
    theme: "ssc",
    durationMinutes: 60,
    totalQuestions: 100,
    markingRule: { correct: 2, incorrect: -0.5 },
    shortcutsPhilosophy: "Vedic multiplication, Ratio & Proportion shortcuts, Quick compound interest scaling."
  },
  {
    id: "sbi-po",
    name: "SBI PO Prelims",
    category: "banking",
    theme: "banking",
    durationMinutes: 60,
    totalQuestions: 100,
    markingRule: { correct: 1, incorrect: -0.25 },
    shortcutsPhilosophy: "Data Interpretation fast addition, Quadratic Equation sign method, Approximation techniques."
  },
  {
    id: "defence-gd",
    name: "Indian Army GD Constable",
    category: "defence",
    theme: "defence",
    durationMinutes: 60,
    totalQuestions: 50,
    markingRule: { correct: 2, incorrect: -0.5 },
    shortcutsPhilosophy: "Direct formulas, Mensuration standard charts, Unit digit inspection."
  }
];

export const SYLLABUS_CHAPTERS: SyllabusChapter[] = [
  {
    id: "num-system",
    name: "Number System",
    subtopics: ["Divisibility Rules", "Unit Digit", "HCF & LCM", "Remainder Theorem", "Fractions"],
    importance: "High",
    pyqFrequencyPercent: 88,
    shortcutFormula: "Divisibility rule checking: Check choices for sum of digits / ending digits directly."
  },
  {
    id: "percent",
    name: "Percentage",
    subtopics: ["Fraction to Percentage tables", "Net Effect Formula", "Income & Expenditure", "Election Questions"],
    importance: "High",
    pyqFrequencyPercent: 95,
    shortcutFormula: "Net Effect = A + B + (AB / 100). Use fraction equivalence: 1/6 = 16.66%, 1/8 = 12.5%."
  },
  {
    id: "profit-loss",
    name: "Profit, Loss & Discount",
    subtopics: ["Markup vs Discount", "Dishonest Shopkeeper", "Successive Discounts", "CP/SP Relations"],
    importance: "High",
    pyqFrequencyPercent: 92,
    shortcutFormula: "CP : MP = (100 - D%) : (100 + P%). Dishonest dealer profit = [Error / (True Value - Error)] * 100%."
  },
  {
    id: "time-work",
    name: "Time & Work",
    subtopics: ["LCM Efficiency Method", "Men, Women & Children", "Pipes & Cisterns", "Wages"],
    importance: "High",
    pyqFrequencyPercent: 86,
    shortcutFormula: "Use LCM as Total Work. Work = Efficiency * Time. M1 * D1 * H1 / W1 = M2 * D2 * H2 / W2."
  },
  {
    id: "speed-distance",
    name: "Speed, Time & Distance",
    subtopics: ["Average Speed", "Train Problems", "Relative Speed", "Boats & Streams"],
    importance: "High",
    pyqFrequencyPercent: 84,
    shortcutFormula: "Average Speed = 2xy/(x+y). Boat speed (u) = (Downstream + Upstream)/2. Stream speed (v) = (Down + Up)/2."
  },
  {
    id: "algebra",
    name: "Algebra",
    subtopics: ["Identity formula applications", "Value Putting method", "Quadratic Roots", "Symmetric equations"],
    importance: "Medium",
    pyqFrequencyPercent: 78,
    shortcutFormula: "If x + 1/x = k, then x^2 + 1/x^2 = k^2 - 2, and x^3 + 1/x^3 = k^3 - 3k."
  },
  {
    id: "geometry",
    name: "Geometry",
    subtopics: ["Triangle Similarity", "Circle Tangents", "Angle bisector theorem", "Right Triangle triplets"],
    importance: "Medium",
    pyqFrequencyPercent: 75,
    shortcutFormula: "Use standard Pythagorean triplets (3-4-5, 5-12-13, 8-15-17). Sum of angles in n-sided polygon = (n-2)*180."
  },
  {
    id: "mensuration",
    name: "Mensuration (2D & 3D)",
    subtopics: ["Area of Triangles/Circles", "Volume of Cone/Cylinder/Sphere", "Prism & Pyramid", "Percentage change in Volume"],
    importance: "High",
    pyqFrequencyPercent: 80,
    shortcutFormula: "Pi (22/7) is in calculations. Check options divisible by 11. 3D volume scaling is factor^3."
  }
];

export interface ExamTrend {
  year: number;
  mathWeightage: string;
  keyTopicsAsked: string[];
  toughPatternsAnalysis: string;
  pointByPointNotes: string[];
}

export interface SyllabusPDFGuide {
  examId: string;
  examName: string;
  currentYearSyllabus: {
    sectionName: string;
    subtopics: string[];
    importantNotes: string;
  }[];
  trends2010_2025: ExamTrend[];
}

export const EXAM_SYLLABUS_PDFS: SyllabusPDFGuide[] = [
  {
    examId: "ssc-cgl",
    examName: "SSC CGL (Staff Selection Commission)",
    currentYearSyllabus: [
      {
        sectionName: "Quantitative Aptitude (CGL Tier-1 & 2)",
        subtopics: ["Arithmetic Operations", "Percentage, Ratio & Proportion", "Square roots, Averages", "Profit & Loss, Discount, Partnership", "Time & Work, Speed, Time & Distance", "Algebraic Identities & Graphs", "Triangle Congruence & Similarity", "Circles, Tangents, Angles", "Prism, Cone, Cylinder, Sphere", "Trigonometric Ratios & Heights"],
        importantNotes: "Syllabus focuses heavily on quick computations and algebraic value substitution. Tier-2 introduces coordinate geometry and data charts."
      },
      {
        sectionName: "General Awareness",
        subtopics: ["History & Culture", "Geography, Economic Scene", "General Policy & Scientific Research", "Current Affairs (National & International)"],
        importantNotes: "Questions test candidate's general awareness of the environment and its application to society."
      }
    ],
    trends2010_2025: [
      {
        year: 2025,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["LCM Work Efficiency", "Successive Discounts", "Algebra x + 1/x powers", "Geometry Right Triangles"],
        toughPatternsAnalysis: "Shifted towards advanced geometry property proofs and successive compound interest fractions.",
        pointByPointNotes: [
          "Vedic root approximation was the fastest solver method for large compound interest calculations.",
          "Circle secant-tangent theorem (PT² = PA × PB) appeared in 85% of exam shifts.",
          "Net change in volume for spheres/cylinders required digit sum modulo 9 checks to avoid decimal fractions."
        ]
      },
      {
        year: 2024,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["Quadratic sign values", "Relative speed trains", "Trig heights value putting"],
        toughPatternsAnalysis: "High proportion of symmetric algebra equations requiring constant value substitution (putting x = 1, y = 0).",
        pointByPointNotes: [
          "Value substitution method (e.g., x=1, y=1) reduced average solving time from 40s to 12s on algebraic identities.",
          "Relative speed problems featured trains crossing moving platforms, solved by adding lengths.",
          "Trigonometric expressions of type a·sin²θ + b·cos²θ solved directly using max/min rules."
        ]
      },
      {
        year: 2022,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["HCF/LCM remainders", "Partner investment shares", "Mensuration cylinders"],
        toughPatternsAnalysis: "Strong emphasis on partnerships with variable investment durations and Number System remainders.",
        pointByPointNotes: [
          "Remainder theorem questions using Fermat's Little Theorem (a^(p-1) ≡ 1 mod p) solved in 5 seconds.",
          "Partnership profits shared strictly in the ratio of (Capital × Duration) parts.",
          "Divisibility rules of 72 (check for 8 and 9) were the most frequent number system pattern."
        ]
      },
      {
        year: 2020,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["Average replacement weight", "CI compounding double rules", "Algebraic cube identities"],
        toughPatternsAnalysis: "Tough compound interest problems with 5-month and 8-month compounding intervals.",
        pointByPointNotes: [
          "CI compounding of 8-months for 2 years solved by setting R_new = R × 8/12 and Time = 3 compounding cycles.",
          "Average shift calculations solved via net weight deviations without computing total weights.",
          "Identity a³ + b³ + c³ - 3abc = (a+b+c)(a²+b²+c²-ab-bc-ca) checked directly for a+b+c=0."
        ]
      },
      {
        year: 2018,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["Time Work efficiency ratios", "Train speed conversions", "Percentage elections"],
        toughPatternsAnalysis: "Traditional arithmetic questions with large numbers demanding fast calculation limits.",
        pointByPointNotes: [
          "Efficiency ratio shifts: A is 40% more efficient than B implies efficiency ratio A:B = 7:5.",
          "Train problems crossing standing poles required converting km/h to m/s by multiplying by 5/18.",
          "Election percentages solved by taking total votes as 100x and tracking invalid votes subtraction."
        ]
      },
      {
        year: 2015,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["Ratio copper zinc", "Simple interest doubling", "Profit loss markup ratios"],
        toughPatternsAnalysis: "Basic percentage scales, CP/SP formulas, and alloy ratio distributions.",
        pointByPointNotes: [
          "Simple interest sum doubles in T years means Rate × T = 100. Universal formula for doubling.",
          "Alloy ratios solved by normalizing total parts of both mixtures to their LCM.",
          "CP to Mark Price ratio formula: CP/MP = (100 - Discount%) / (100 + Profit%) was highly tested."
        ]
      },
      {
        year: 2010,
        mathWeightage: "25 Qs (50 Marks)",
        keyTopicsAsked: ["Basic linear equation ratio", "Fractions comparisons", "Work together rates"],
        toughPatternsAnalysis: "Arithmetical fractions comparison and basic unitary method questions.",
        pointByPointNotes: [
          "Comparing fractions: Cross-multiply numerators and denominators to check larger value instantly.",
          "Unitary method: A does work in X days, B in Y days, together in (X × Y) / (X + Y) days.",
          "Basic ratio scaling: If A:B = 2:3 and B:C = 4:5, scale B to LCM 12 to yield A:B:C = 8:12:15."
        ]
      }
    ]
  },
  {
    examId: "rrb-alp",
    examName: "RRB ALP & Technician (Railway Recruitment Board)",
    currentYearSyllabus: [
      {
        sectionName: "Mathematics CBT-1 & 2",
        subtopics: ["Number System, Decimals & Fractions", "L.C.M & H.C.F", "Ratio & Proportion, Percentage", "Mensuration, Time & Work", "Time & Distance, Simple & Compound Interest", "Algebra, Geometry & Trigonometry", "Elementary Statistics, Square Root", "Age Calculations, Calendar & Clock", "Pipes & Cisterns"],
        importantNotes: "Very high weightage on arithmetical concepts, statistics, and calculations like square roots and age shortcuts."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "20 Qs (20 Marks)",
        keyTopicsAsked: ["Pipe filling emptying rates", "Decimal decimal additions", "LCM HCF relations"],
        toughPatternsAnalysis: "High frequency of pipes & cisterns questions featuring leakages and negative work.",
        pointByPointNotes: [
          "Emptier pipe efficiency is negative. Total work is LCM. Net rate = Filler rate - Emptier rate.",
          "Decimals comparison solved by padding equal numbers of zeroes behind decimal points.",
          "First Number × Second Number = HCF × LCM is the core number system theorem."
        ]
      },
      {
        year: 2018,
        mathWeightage: "20 Qs (20 Marks)",
        keyTopicsAsked: ["Square root Vedic methods", "Clock angle formulas", "Age ratio variables"],
        toughPatternsAnalysis: "Introduced physics-linked speed and unit dimensions alongside arithmetic.",
        pointByPointNotes: [
          "Pipes & Cisterns: Net time together = (A × B) / (B - A) for one filling and one draining.",
          "Vedic Square Roots: Square root of 4624 is 68 because last digit 4 implies ending in 2 or 8, and 46 lies in 60-70 range.",
          "Angle between clock hands: Angle = |30H - 11/2M| degrees."
        ]
      }
    ]
  },
  {
    examId: "rrb-ntpc",
    examName: "RRB NTPC CBT-1 & CBT-2",
    currentYearSyllabus: [
      {
        sectionName: "Mathematics (CBT-1: 30 Qs | CBT-2: 35 Qs)",
        subtopics: ["Number System", "Decimals & Fractions", "LCM & HCF", "Ratio & Proportion", "Percentage", "Mensuration", "Time & Work", "Time & Distance", "Simple & Compound Interest", "Profit & Loss", "Elementary Algebra", "Geometry & Trigonometry", "Elementary Statistics"],
        importantNotes: "CBT-2 has higher difficulty, additional Data Interpretation. Focus on LCM method and quick percentage approximation."
      },
      {
        sectionName: "General Intelligence & Reasoning (CBT-1: 30 Qs)",
        subtopics: ["Analogies", "Completion of Number/Alphabetical Series", "Coding & Decoding", "Mathematical Operations", "Relationships", "Syllogism", "Jumbling", "Venn Diagram", "Data Interpretation", "Conclusion & Decision Making"],
        importantNotes: "Pattern-based questions. Practice coding-decoding and analogy series intensively for speed."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "30 Qs (30 Marks)",
        keyTopicsAsked: ["SI/CI formula application", "Mensuration cylinder cone", "Ratio proportion mixing"],
        toughPatternsAnalysis: "High frequency of alligation and mixture problems using ratio cross-method.",
        pointByPointNotes: [
          "Alligation rule: (C - Mean) / (Mean - C') gives mixture ratio directly.",
          "For train crossing questions, always identify if a platform, pole, or bridge is involved and add lengths accordingly.",
          "Statistics questions: Mean of n observations = Sum / n. Mean of combined groups uses weighted average formula."
        ]
      },
      {
        year: 2019,
        mathWeightage: "30 Qs (30 Marks)",
        keyTopicsAsked: ["Boat upstream downstream", "Percentage income change", "Simple interest shortcuts"],
        toughPatternsAnalysis: "Boat speed and stream problems using formula-based direct approach.",
        pointByPointNotes: [
          "Boat speed = (Downstream + Upstream) / 2. Stream speed = (Downstream - Upstream) / 2.",
          "SI formula: I = PRT/100. When sum doubles, I = P, so T = 100/R.",
          "Income + Expenditure change: Use net change formula A + B + AB/100."
        ]
      }
    ]
  },
  {
    examId: "wb-police-constable",
    examName: "West Bengal Police Constable",
    currentYearSyllabus: [
      {
        sectionName: "Arithmetic (25 Qs)",
        subtopics: ["Number System", "LCM & HCF", "Fractions & Decimals", "Percentage", "Profit & Loss", "Simple Interest", "Ratio & Proportion", "Time & Work", "Speed, Distance & Time", "Mensuration"],
        importantNotes: "Questions are of moderate difficulty, with emphasis on basic arithmetic and mental maths. Bengali medium students should practice Bengali numerical vocabulary."
      },
      {
        sectionName: "General Knowledge (25 Qs)",
        subtopics: ["West Bengal History & Culture", "Indian History", "Geography of West Bengal & India", "Indian Constitution & Polity", "Current Affairs (WB & National)", "Science & Technology"],
        importantNotes: "Heavy focus on West Bengal current affairs, state-level GK. Study WB CM, governor, districts, rivers, and major events."
      },
      {
        sectionName: "English Language (10 Qs)",
        subtopics: ["Vocabulary", "Grammar", "Comprehension", "Sentence Correction"],
        importantNotes: "Basic English level. Focus on common grammar rules and reading comprehension."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "25 Qs - Moderate Difficulty",
        keyTopicsAsked: ["সরল সুদ (Simple Interest)", "লাভ-ক্ষতি (Profit & Loss)", "শতকরা (Percentage)"],
        toughPatternsAnalysis: "Questions on percentage population increase and simple interest doubling are very frequent.",
        pointByPointNotes: [
          "বার্ষিক সরল সুদের হার R তে আসল দ্বিগুণ হতে সময় = 100/R বছর।",
          "ক্রয়মূল্য ও বিক্রয়মূল্যের অনুপাত থেকে: Gain% = (SP - CP) / CP × 100।",
          "শতকরা বৃদ্ধির প্রশ্নে Net Change = A + B + AB/100 সূত্র ব্যবহার করুন।"
        ]
      },
      {
        year: 2021,
        mathWeightage: "25 Qs - Moderate Difficulty",
        keyTopicsAsked: ["LCM HCF বেসিক", "অনুপাত সমানুপাত", "জ্যামিতি"],
        toughPatternsAnalysis: "Elementary ratio & proportion with partner profit sharing patterns.",
        pointByPointNotes: [
          "দুটি সংখ্যার গুণফল = LCM × HCF। এই সূত্রে সবসময় দুটি সংখ্যার ক্ষেত্রে প্রযোজ্য।",
          "অনুপাত ভাগের প্রশ্নে সব অংশ যোগ করে মোট ভাগ বের করুন।",
          "বৃত্তের ক্ষেত্রফল = πr², পরিধি = 2πr। π = 22/7 ব্যবহার করুন।"
        ]
      }
    ]
  },
  {
    examId: "wbpsc-food-si",
    examName: "WBPSC Food Sub-Inspector",
    currentYearSyllabus: [
      {
        sectionName: "Arithmetic & Mathematics (30 Qs)",
        subtopics: ["Number Theory", "Percentage, Profit & Loss", "Simple & Compound Interest", "Ratio & Proportion", "Time & Work, Pipes & Cisterns", "Speed, Distance & Time", "Mensuration", "Statistics (Mean, Median, Mode)", "Mixture & Alligation", "Partnership"],
        importantNotes: "WBPSC Food SI has higher math standard. Partnership, Mixture & Alligation, and CI are frequently tested at moderate to hard difficulty."
      },
      {
        sectionName: "General Studies (40 Qs)",
        subtopics: ["West Bengal Affairs", "Indian History, Geography & Economy", "Indian Constitution", "Science & Environment", "Current Events"],
        importantNotes: "WB-specific GK is most important. Read WB State Budget, important schemes, WB districts and headquarters."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "30 Qs - Moderate/Hard",
        keyTopicsAsked: ["Partnership profit sharing", "Compound interest", "Mixture alligation"],
        toughPatternsAnalysis: "Partnership with varying investment durations and CI with fractional periods appeared most.",
        pointByPointNotes: [
          "Partnership with time: Profit ratio = Capital_A × Time_A : Capital_B × Time_B.",
          "CI for n years = P × (1 + R/100)^n. For half-yearly: double n, halve R.",
          "Alligation: (Higher Quantity - Mean) / (Mean - Lower Quantity) = Cheaper Quantity / Costlier Quantity."
        ]
      },
      {
        year: 2019,
        mathWeightage: "30 Qs - Moderate/Hard",
        keyTopicsAsked: ["Mensuration cylinder volume", "Statistics mean median", "Ratio proportion"],
        toughPatternsAnalysis: "Statistics (mean, median, mode) and 3D mensuration were uniquely weighted.",
        pointByPointNotes: [
          "Median of sorted data: if n is odd = (n+1)/2 th term; if even = average of n/2 and (n/2 + 1) th term.",
          "Mode = value appearing most frequently in a dataset.",
          "Cylinder volume = πr²h. If radius doubles and height halves: volume = 4/2 = 2 times original."
        ]
      }
    ]
  },
  {
    examId: "ssc-chsl",
    examName: "SSC CHSL Tier-1 & Tier-2",
    currentYearSyllabus: [
      {
        sectionName: "Quantitative Aptitude (25 Qs - Tier 1 | 60 Qs - Tier 2)",
        subtopics: ["Number System", "Percentage", "Ratio & Proportion", "Average", "Interest (Simple & Compound)", "Profit & Loss & Discount", "Speed, Distance & Time", "Time & Work", "Geometry (Lines, Angles, Triangles, Circles)", "Mensuration", "Trigonometry", "Data Interpretation (Pie Chart, Bar, Line Graph)"],
        importantNotes: "CHSL Tier-2 introduced new DI sections with table charts. Focus on Vedic multiplication and direct formula application. Trigonometry height problems are increasing."
      },
      {
        sectionName: "English Language (25 Qs - Tier 1)",
        subtopics: ["Spot Error", "Fill in the Blanks", "Synonyms/Antonyms", "Spellings", "Phrases & Idioms", "One Word Substitution", "Sentence Improvement", "Active/Passive Voice", "Reading Comprehension"],
        importantNotes: "Reading comprehension passages have become longer. Focus on Spot Error and Sentence Improvement as the most frequent."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "25 Qs - Easy/Moderate",
        keyTopicsAsked: ["Successive discounts", "Percentage reverse calculation", "Speed trains"],
        toughPatternsAnalysis: "Reverse percentage and successive discount calculations appear in 70% of shifts.",
        pointByPointNotes: [
          "Successive Discount of A% and B%: Net discount = A + B - AB/100%.",
          "Reverse percentage: If price after 20% discount is 400, CP = 400 × 100/80 = 500.",
          "Time ratio trick: if speed ratio is A:B, time ratio is B:A for same distance."
        ]
      },
      {
        year: 2018,
        mathWeightage: "25 Qs - Easy/Moderate",
        keyTopicsAsked: ["Area perimeter triangles", "Fractions comparison", "CI vs SI difference"],
        toughPatternsAnalysis: "Geometry area calculations and CI-SI difference formula repeatedly appeared.",
        pointByPointNotes: [
          "SI for 2 years = 2PRT/100. CI for 2 years = P[(1+R/100)^2 - 1]. Diff = P(R/100)^2.",
          "Area of equilateral triangle = (√3/4) × a². Perimeter = 3a.",
          "Heron's formula: Area = √[s(s-a)(s-b)(s-c)] where s = (a+b+c)/2."
        ]
      }
    ]
  },
  {
    examId: "sbi-po",
    examName: "SBI PO Prelims & Mains",
    currentYearSyllabus: [
      {
        sectionName: "Quantitative Aptitude (Prelims: 35 Qs | Mains: 35 Qs)",
        subtopics: ["Simplification & Approximation", "Profit & Loss", "Mixtures & Allegations", "Simple Interest & Compound Interest", "Surds & Indices", "Work & Time", "Time & Distance", "Mensuration", "Data Interpretation (Tabular, Bar, Line, Pie)", "Ratio & Proportion, Percentages", "Number Systems", "Quadratic Equations", "Number Series", "Permutation & Combination", "Probability"],
        importantNotes: "SBI PO is India's highest standard banking exam. DI sets are 5 Qs each. Quadratic equations use sign method. Approximation is critical — practice rounding to 2 significant figures."
      },
      {
        sectionName: "Reasoning Ability (Prelims: 35 Qs | Mains: 45 Qs)",
        subtopics: ["Puzzles & Seating Arrangement", "Linear & Circular Arrangements", "Blood Relations", "Syllogisms", "Input-Output", "Coding-Decoding", "Inequalities", "Alphanumeric Series", "Direction & Ranking", "Critical Reasoning (Mains)"],
        importantNotes: "Puzzles dominate mains reasoning. Practice complex 6-variable floor puzzles and seating arrangements with conditions."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "35 Qs (Prelims) + 35 Qs (Mains)",
        keyTopicsAsked: ["DI Tabular (5 Qs)", "Quadratic equations (5 Qs)", "Boats & Streams", "CI/SI comparison"],
        toughPatternsAnalysis: "DI questions had percentage calculation across multiple categories. Quadratic roots by sign factoring.",
        pointByPointNotes: [
          "DI speed: Calculate base denominator first and store mentally. Divide numerators by it for percentages.",
          "Quadratic sign method: x² - (sum)x + (product) = 0. Sign tells nature of roots: (-, +) = two positives.",
          "Boat problems: If upstream = U km/h, downstream = D km/h. Still water = (D+U)/2. Stream = (D-U)/2."
        ]
      },
      {
        year: 2020,
        mathWeightage: "35 Qs (Prelims)",
        keyTopicsAsked: ["Approximation (10 Qs)", "Number Series (5 Qs)", "DI Bar Graph (5 Qs)"],
        toughPatternsAnalysis: "Approximation had complex BODMAS with decimals. Number series had alternating difference patterns.",
        pointByPointNotes: [
          "Approximation rule: Round values to nearest 5 or 10 before calculating to save time.",
          "For number series: find 1st, 2nd difference. If 2nd difference is constant, it's a quadratic series.",
          "Probability: P(A ∩ B) = P(A) × P(B) if A and B are independent events."
        ]
      }
    ]
  },
  {
    examId: "defence-gd",
    examName: "Indian Army GD Constable (CEE)",
    currentYearSyllabus: [
      {
        sectionName: "General Knowledge (35 Qs)",
        subtopics: ["Indian History & Culture", "Indian Constitution & Polity", "Geography of India & World", "Current Affairs (Defence & National)", "Science & Technology", "Sports & Awards", "Indian Economy"],
        importantNotes: "Defence GD has strong GK emphasis. Focus on Indian Army history, defence policies, wars, national awards, and recent defence acquisitions."
      },
      {
        sectionName: "Mathematics (15 Qs)",
        subtopics: ["LCM & HCF", "Number System", "Decimal Fractions", "Square Root & Cube Root", "Percentage", "Average", "Ratio & Proportion", "Profit & Loss", "Simple Interest", "Mensuration"],
        importantNotes: "Maths is Class 10 level. Focus on direct formula application. No advanced algebra or geometry needed."
      },
      {
        sectionName: "General Science (20 Qs)",
        subtopics: ["Physics (Motion, Force, Light, Sound)", "Chemistry (Metals, Non-metals, Reactions)", "Biology (Cell, Nutrition, Disease, Human Body)", "Computer Basics"],
        importantNotes: "Science questions target Class 10 NCERT concepts. Focus on definitions and direct factual recall."
      }
    ],
    trends2010_2025: [
      {
        year: 2024,
        mathWeightage: "15 Qs - Class 10 Level",
        keyTopicsAsked: ["Square root Vedic", "Simple interest doubline", "Percentage profit"],
        toughPatternsAnalysis: "All questions are direct formula applications with no multi-step derivations needed.",
        pointByPointNotes: [
          "Simple Interest doubling: If sum doubles in T years at R% SI, then R × T = 100.",
          "Percentage profit: if CP = 80, SP = 100. Profit = 20. Profit% = 20/80 × 100 = 25%.",
          "Square root Vedic trick: For √5476, last digit 6 implies root ends in 4 or 6. 74² = 5476. Ans: 74."
        ]
      },
      {
        year: 2019,
        mathWeightage: "15 Qs - Class 10 Level",
        keyTopicsAsked: ["Mensuration basic shapes", "Average", "LCM HCF"],
        toughPatternsAnalysis: "Very basic arithmetic. Speed and accuracy are tested rather than concept complexity.",
        pointByPointNotes: [
          "Area of rectangle = L × B. Perimeter = 2(L + B). Practice unit conversions: 1 m² = 10000 cm².",
          "Average formula: Sum = Average × Number of items. If one item changes, new average shifts proportionally.",
          "HCF × LCM = Product of two numbers. This shortcut is tested repeatedly."
        ]
      }
    ]
  }
];

export function getExamConfig(id: string): ExamConfig {
  return EXAM_LIST.find(e => e.id === id) || EXAM_LIST[0];
}

export function getSyllabusPDF(examId: string): SyllabusPDFGuide | undefined {
  return EXAM_SYLLABUS_PDFS.find(g => g.examId === examId);
}

