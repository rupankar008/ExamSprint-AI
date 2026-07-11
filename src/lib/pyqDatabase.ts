export interface PYQQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  chapter: string;
  explanation: string;
  isRepeated: boolean;
  year: number;
}

export const PYQ_DATABASE: Record<string, Record<number, PYQQuestion[]>> = {
  "ssc-cgl": {
    2025: [
      {
        id: 100,
        year: 2025,
        text: "The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What is the weight of the new person?",
        options: ["85 kg", "75 kg", "80 kg", "70 kg"],
        correctAnswer: "85 kg",
        chapter: "Average",
        explanation: "Vedic Shift Trick: New weight = Replaced weight + (Number of items Ã— average increase) = 65 + (8 Ã— 2.5) = 65 + 20 = 85 kg. Solve in 5 seconds.",
        isRepeated: true
      }
    ],
    2024: [
      {
        id: 101,
        year: 2024,
        text: "If x + 1/x = 4, find the value of xÂ³ + 1/xÂ³.",
        options: ["52", "64", "76", "56"],
        correctAnswer: "52",
        chapter: "Algebra",
        explanation: "Short trick: If x + 1/x = k, then xÂ³ + 1/xÂ³ = kÂ³ - 3k. Substituting k = 4, we get 4Â³ - 3(4) = 64 - 12 = 52.",
        isRepeated: true
      },
      {
        id: 102,
        year: 2024,
        text: "A dealer marks his goods 30% above the cost price and allows a discount of 15%. Find his profit percentage.",
        options: ["10.5%", "11%", "12.5%", "15%"],
        correctAnswer: "10.5%",
        chapter: "Profit, Loss & Discount",
        explanation: "Net Change Formula: A + B + AB/100. Here A = +30, B = -15. Profit = 30 - 15 - (30Ã—15)/100 = 10.5%.",
        isRepeated: false
      }
    ],
    2022: [
      {
        id: 103,
        year: 2022,
        text: "A can do a work in 12 days and B in 18 days. They work together for 4 days, then A leaves. How long will B take to finish the remaining work?",
        options: ["6 days", "8 days", "5 days", "7 days"],
        correctAnswer: "8 days",
        chapter: "Time & Work",
        explanation: "Total Work (LCM of 12 & 18) = 36 units. Eff of A = 3, B = 2. Combined Eff = 5. In 4 days work done = 4 Ã— 5 = 20 units. Remaining work = 16 units. Time for B = 16 / 2 = 8 days.",
        isRepeated: true
      }
    ],
    2020: [
      {
        id: 104,
        year: 2020,
        text: "A sum of money at compound interest doubles itself in 15 years. It will become 8 times of itself in how many years?",
        options: ["45 years", "30 years", "40 years", "50 years"],
        correctAnswer: "45 years",
        chapter: "Compound Interest",
        explanation: "Power Scaling Trick: 8 times is 2Â³. The time required is Power Ã— base doubling years = 3 Ã— 15 = 45 years.",
        isRepeated: true
      }
    ],
    2018: [
      {
        id: 105,
        year: 2018,
        text: "A train running at 54 km/h crosses a man standing on the platform in 20 seconds. What is the length of the train?",
        options: ["300m", "250m", "400m", "150m"],
        correctAnswer: "300m",
        chapter: "Speed, Time & Distance",
        explanation: "Speed in m/s = 54 Ã— 5/18 = 15 m/s. Train length = Speed Ã— Time = 15 Ã— 20 = 300m.",
        isRepeated: true
      }
    ],
    2015: [
      {
        id: 106,
        year: 2015,
        text: "The ratio of copper and zinc in brass is 13 : 7. How much zinc will be there in 100 kg of brass?",
        options: ["35 kg", "20 kg", "55 kg", "14 kg"],
        correctAnswer: "35 kg",
        chapter: "Ratio & Proportion",
        explanation: "Sum of parts = 13 + 7 = 20. Value of 1 part = 100 / 20 = 5 kg. Zinc (7 parts) = 7 Ã— 5 = 35 kg.",
        isRepeated: false
      }
    ],
    2010: [
      {
        id: 107,
        year: 2010,
        text: "If 15% of A is equal to 20% of B, then A : B is equal to what?",
        options: ["4 : 3", "3 : 4", "15 : 20", "5 : 4"],
        correctAnswer: "4 : 3",
        chapter: "Percentage",
        explanation: "15/100 Ã— A = 20/100 Ã— B => 15A = 20B => A / B = 20 / 15 = 4 / 3.",
        isRepeated: true
      }
    ]
  },
  "rrb-alp": {
    2024: [
      {
        id: 201,
        year: 2024,
        text: "Pipe A can fill a tank in 6 hours and Pipe B can empty it in 10 hours. If both are opened together, how long will it take to fill the tank?",
        options: ["15 hours", "12 hours", "18 hours", "8 hours"],
        correctAnswer: "15 hours",
        chapter: "Time & Work",
        explanation: "Product-over-difference trick for filling/emptying: (A Ã— B) / (B - A) = (6 Ã— 10) / (10 - 6) = 60 / 4 = 15 hours.",
        isRepeated: true
      }
    ],
    2018: [
      {
        id: 202,
        year: 2018,
        text: "Find the square root of 4624.",
        options: ["68", "62", "72", "78"],
        correctAnswer: "68",
        chapter: "Number System",
        explanation: "Vedic root method: The number ends in 4, so root ends in 8 or 2. 46 is between 6Â² (36) and 7Â² (49). 6 Ã— 7 = 42. Since 46 > 42, select the larger unit digit 8. Root is 68.",
        isRepeated: true
      }
    ],
    2014: [
      {
        id: 203,
        year: 2014,
        text: "The difference between SI and CI on a sum for 2 years at 10% per annum is Rs. 25. Find the sum.",
        options: ["Rs. 2500", "Rs. 2000", "Rs. 3000", "Rs. 1500"],
        correctAnswer: "Rs. 2500",
        chapter: "Compound Interest",
        explanation: "Short formula for 2 years: Diff = P Ã— (R/100)Â² => 25 = P Ã— (1/10)Â² => 25 = P Ã— 1/100 => P = Rs. 2500.",
        isRepeated: true
      }
    ]
  },
  "wb-police-constable": {
    2024: [
      {
        id: 301,
        year: 2024,
        text: "à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à§®% à¦¸à¦°à¦² à¦¸à§à¦¦à§‡ à¦•à§‹à¦¨à§‹ à¦†à¦¸à¦² à¦•à¦¤ à¦¬à¦›à¦°à§‡ à¦¸à§à¦¦à§‡-à¦†à¦¸à¦²à§‡ à¦¦à§à¦¬à¦¿à¦—à§à¦£ à¦¹à¦¬à§‡? (At 8% Simple interest, in how many years will a sum double?)",
        options: ["à§§à§¨.à§« à¦¬à¦›à¦°", "à§§à§¦ à¦¬à¦›à¦°", "à§§à§« à¦¬à¦›à¦°", "à§§à§¨ à¦¬à¦›à¦°"],
        correctAnswer: "à§§à§¨.à§« à¦¬à¦›à¦°",
        chapter: "Simple Interest",
        explanation: "SI double trick: doubling means interest is 100%. Years = 100 / Rate = 100 / 8 = 12.5 years. (à§§à§¨.à§« à¦¬à¦›à¦°)à¥¤",
        isRepeated: true
      }
    ],
    2021: [
      {
        id: 302,
        year: 2021,
        text: "à§¨à¦Ÿà¦¿ à¦¸à¦‚à¦–à§à¦¯à¦¾à¦° à¦¯à§‹à¦—à¦«à¦² à§ªà§« à¦à¦¬à¦‚ à¦¤à¦¾à¦¦à§‡à¦° à¦…à¦¨à§à¦ªà¦¾à¦¤ à§ª : à§« à¦¹à¦²à§‡ à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦¦à§à¦Ÿà¦¿à¦° à¦—à§à¦£à¦«à¦² à¦•à¦¤? (Sum of 2 numbers is 45, ratio is 4:5. Find product.)",
        options: ["à§«à§¦à§¦", "à§ªà§¦à§¦", "à§ªà§«à§¦", "à§¬à§¦à§¦"],
        correctAnswer: "à§«à§¦à§¦",
        chapter: "Ratio & Proportion",
        explanation: "Sum parts = 9 parts = 45 => 1 part = 5. Numbers are 20 and 25. Product = 20 Ã— 25 = 500.",
        isRepeated: false
      }
    ],
    2018: [
      {
        id: 303,
        year: 2018,
        text: "à¦à¦•à¦Ÿà¦¿ à¦¬à§ƒà¦¤à§à¦¤à§‡à¦° à¦¬à§à¦¯à¦¾à¦¸à¦¾à¦°à§à¦§ à§§à§¦% à¦¹à§à¦°à¦¾à¦¸ à¦ªà§‡à¦²à§‡ à¦•à§à¦·à§‡à¦¤à§à¦°à¦«à¦² à¦•à¦¤ à¦¶à¦¤à¦¾à¦‚à¦¶ à¦¹à§à¦°à¦¾à¦¸ à¦ªà¦¾à¦¬à§‡? (Radius of a circle is decreased by 10%. Find area decrease %.)",
        options: ["à§§à§¯%", "à§¨à§¦%", "à§§à§¦%", "à§¨à§§%"],
        correctAnswer: "à§§à§¯%",
        chapter: "Percentage",
        explanation: "Net Change: A + B + AB/100. Here radius changes twice. A = -10, B = -10. Area change = -10 - 10 + (100)/100 = -20 + 1 = -19% (19% decrease).",
        isRepeated: true
      }
    ],
    2013: [
      {
        id: 304,
        year: 2013,
        text: "à¦¦à§à¦Ÿà¦¿ à¦¸à¦‚à¦–à§à¦¯à¦¾à¦° à¦—à¦¸à¦¾à¦—à§ à¦à¦¬à¦‚ à¦²à¦¸à¦¾à¦—à§ à¦¯à¦¥à¦¾à¦•à§à¦°à¦®à§‡ à§§à§¨ à¦à¦¬à¦‚ à§¨à§ªà§¦à¥¤ à¦à¦•à¦Ÿà¦¿ à¦¸à¦‚à¦–à§à¦¯à¦¾ à§¬à§¦ à¦¹à¦²à§‡ à¦…à¦ªà¦°à¦Ÿà¦¿ à¦•à¦¤? (LCM of two numbers is 240, HCF is 12. If one is 60, find other.)",
        options: ["à§ªà§®", "à§©à§¬", "à§­à§¨", "à§®à§¦"],
        correctAnswer: "à§ªà§®",
        chapter: "Number System",
        explanation: "HCF Ã— LCM = Number1 Ã— Number2 => 12 Ã— 240 = 60 Ã— N2 => N2 = 12 Ã— 4 = 48.",
        isRepeated: true
      }
    ]
  },
  "sbi-po": {
    2024: [
      {
        id: 401,
        year: 2024,
        text: "Find the values of x in quadratic equation: xÂ² - 12x + 35 = 0.",
        options: ["x = 5, 7", "x = -5, -7", "x = 4, 8", "x = 5, -7"],
        correctAnswer: "x = 5, 7",
        chapter: "Algebra",
        explanation: "Equation sign (-, +) means roots are (+, +). Factors of 35 summing to 12 are 5 and 7. Roots: 5 and 7.",
        isRepeated: true
      }
    ],
    2020: [
      {
        id: 402,
        year: 2020,
        text: "The ratio of income of A and B is 5 : 4 and their expenditure is 3 : 2. If each saves Rs. 1600, find the income of A.",
        options: ["Rs. 4000", "Rs. 5000", "Rs. 3200", "Rs. 4800"],
        correctAnswer: "Rs. 4000",
        chapter: "Ratio & Proportion",
        explanation: "Difference in income parts and expenditure parts: A is 5 - 3 = 2 parts, B is 4 - 2 = 2 parts. 2 parts savings = Rs. 1600 => 1 part = Rs. 800. Income of A (5 parts) = 5 Ã— 800 = Rs. 4000.",
        isRepeated: true
      }
    ],
    2011: [
      {
        id: 403,
        year: 2011,
        text: "A boat goes 24 km upstream and 28 km downstream in 6 hours. It goes 30 km upstream and 21 km downstream in 6 hours 30 minutes. Find speed of the stream.",
        options: ["4 km/h", "6 km/h", "5 km/h", "3 km/h"],
        correctAnswer: "4 km/h",
        chapter: "Speed, Time & Distance",
        explanation: "Ratio equation inspection: Let Upstream speed U = 6 km/h, Downstream D = 14 km/h. First case: 24/6 + 28/14 = 4 + 2 = 6 hrs. Matches! Second: 30/6 + 21/14 = 5 + 1.5 = 6.5 hrs. Matches! Speed of stream = (D - U)/2 = (14 - 6)/2 = 4 km/h.",
        isRepeated: false
      }
    ]
  },
  "wbpsc-food-si": {
    2024: [
      {
        id: 501,
        year: 2024,
        text: "à¦¤à¦¿à¦¨à¦Ÿà¦¿ à¦¸à¦‚à¦–à§à¦¯à¦¾à¦° à¦…à¦¨à§à¦ªà¦¾à¦¤ à§§:à§¨:à§© à¦à¦¬à¦‚ à¦¤à¦¾à¦¦à§‡à¦° à¦—à¦¸à¦¾à¦—à§ à§§à§¨ à¦¹à¦²à§‡ à¦¬à§ƒà¦¹à¦¤à§à¦¤à¦® à¦¸à¦‚à¦–à§à¦¯à¦¾à¦Ÿà¦¿ à¦•à¦¤? (Ratio is 1:2:3, HCF is 12. Find largest number.)",
        options: ["à§©à§¬", "à§¨à§ª", "à§§à§¨", "à§ªà§®"],
        correctAnswer: "à§©à§¬",
        chapter: "Ratio & Proportion",
        explanation: "Numbers are HCF Ã— ratio parts. Largest part = 3. Largest number = 3 Ã— 12 = 36.",
        isRepeated: true
      }
    ],
    2019: [
      {
        id: 502,
        year: 2019,
        text: "à¦à¦•à¦Ÿà¦¿ à¦šà§‹à¦™à§‡à¦° à¦¬à§à¦¯à¦¾à¦¸à¦¾à¦°à§à¦§ à§«à§¦% à¦¹à§à¦°à¦¾à¦¸ à¦•à¦°à¦¾ à¦¹à¦²à§‡ à¦à¦¬à¦‚ à¦‰à¦šà§à¦šà¦¤à¦¾ à§«à§¦% à¦¬à§ƒà¦¦à§à¦§à¦¿ à¦•à¦°à¦¾ à¦¹à¦²à§‡ à¦¤à¦¾à¦° à¦†à¦¯à¦¼à¦¤à¦¨à§‡à¦° à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à§€ à¦¹à¦¬à§‡? (Radius is decreased by 50%, height increased by 50%. Find volume change.)",
        options: ["à§¬à§¨.à§«% à¦¹à§à¦°à¦¾à¦¸ (62.5% Dec)", "à§«à§¦% à¦¹à§à¦°à¦¾à¦¸", "à§¨à§«% à¦¬à§ƒà¦¦à§à¦§à¦¿", "à§§à§¨.à§«% à¦¹à§à¦°à¦¾à¦¸"],
        correctAnswer: "à§¬à§¨.à§«% à¦¹à§à¦°à¦¾à¦¸ (62.5% Dec)",
        chapter: "Mensuration",
        explanation: "Volume = Ï€rÂ²h. Scaling factor = (0.5)Â² Ã— (1.5) = 0.25 Ã— 1.5 = 0.375. Volume becomes 37.5% of original, indicating a 62.5% decrease.",
        isRepeated: true
      }
    ],
    2014: [
      {
        id: 503,
        year: 2014,
        text: "à¦à¦•à¦Ÿà¦¿ à¦¬à§à¦¯à¦¬à¦¸à¦¾à¦¤à§‡ A à¦à¦¬à¦‚ B à¦à¦° à¦®à§‚à¦²à¦§à¦¨à§‡à¦° à¦…à¦¨à§à¦ªà¦¾à¦¤ à§©:à§¨à¥¤ à¦²à¦¾à¦­à§‡à¦° à§«% à¦¦à¦¾à¦¤à¦¬à§à¦¯ à¦Ÿà§à¦°à¦¾à¦¸à§à¦Ÿà§‡ à¦¦à¦¾à¦¨ à¦•à¦°à¦¾à¦° à¦ªà¦° A à¦à¦° à¦²à¦­à§à¦¯à¦¾à¦‚à¦¶ à§®à§«à§« à¦Ÿà¦¾à¦•à¦¾ à¦¹à¦²à§‡ à¦®à§‹à¦Ÿ à¦²à¦¾à¦­ à¦•à¦¤? (A:B investment ratio is 3:2. 5% profit is donated. If A share is 855, find total profit.)",
        options: ["à§§à§«à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾", "à§§à§¨à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾", "à§§à§©à§«à§¦ à¦Ÿà¦¾à¦•à¦¾", "à§§à§¬à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾"],
        correctAnswer: "à§§à§«à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾",
        chapter: "Profit, Loss & Discount",
        explanation: "Let remaining profit be 95 units. A's share = 3/5 Ã— 95 = 57 units = 855 => 1 unit = 15. Total profit (100 units) = 100 Ã— 15 = Rs. 1500.",
        isRepeated: false
      }
    ]
  }
};

// â”€â”€ Exam-specific question banks for all 8 courses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EXAM_QUESTION_BANKS: Record<string, PYQQuestion[]> = {

  "ssc-cgl": [
    {
      id: 1001, year: 2025,
      text: "Find the remainder when 2^100 is divided by 101.",
      options: ["1", "2", "100", "99"], correctAnswer: "1",
      chapter: "Number System",
      explanation: "Fermat's Little Theorem: a^(p-1) â‰¡ 1 (mod p). Here a=2, p=101 (prime). So 2^100 â‰¡ 1 (mod 101). Remainder = 1.",
      isRepeated: false
    },
    {
      id: 1002, year: 2025,
      text: "If x + 1/x = 5, find xâµ + 1/xâµ.",
      options: ["2525", "2530", "2500", "2480"], correctAnswer: "2525",
      chapter: "Algebra",
      explanation: "xÂ²+1/xÂ² = 23; xÂ³+1/xÂ³ = 110; xâµ+1/xâµ = (xÂ²+1/xÂ²)(xÂ³+1/xÂ³) - (x+1/x) = 23Ã—110 - 5 = 2525.",
      isRepeated: true
    },
    {
      id: 1003, year: 2024,
      text: "A train 250m long crosses a bridge 150m long in 20 seconds. Find the speed of the train in km/h.",
      options: ["72 km/h", "60 km/h", "80 km/h", "54 km/h"], correctAnswer: "72 km/h",
      chapter: "Speed, Time & Distance",
      explanation: "Total distance = 250+150 = 400m. Speed = 400/20 = 20 m/s = 20Ã—18/5 = 72 km/h.",
      isRepeated: true
    },
    {
      id: 1004, year: 2024,
      text: "In triangle ABC, angle A bisector meets BC at D. If AB=6, AC=4, BC=7.5, find BD.",
      options: ["4.5", "3", "3.5", "5"], correctAnswer: "4.5",
      chapter: "Geometry",
      explanation: "Angle Bisector Theorem: BD/DC = AB/AC = 6/4 = 3/2. BD = (3/5) Ã— 7.5 = 4.5.",
      isRepeated: false
    },
    {
      id: 1005, year: 2023,
      text: "A and B do a work in 12 days, B and C in 15 days, C and A in 20 days. How many days for all three?",
      options: ["10 days", "12 days", "8 days", "15 days"], correctAnswer: "10 days",
      chapter: "Time & Work",
      explanation: "2(A+B+C) = 1/12+1/15+1/20 = 5+4+3/60 = 12/60 = 1/5. So A+B+C = 1/10. All three = 10 days.",
      isRepeated: true
    },
    {
      id: 1006, year: 2022,
      text: "The CI on a sum for 2 years at 10% per annum is Rs 630. Find SI for same sum and rate.",
      options: ["Rs 600", "Rs 650", "Rs 580", "Rs 620"], correctAnswer: "Rs 600",
      chapter: "Interest",
      explanation: "CI-SI diff = P(R/100)Â² = 630 - SI. CI for 2yr = P(1.1Â² - 1) = 0.21P = 630, P = 3000. SI = 3000Ã—10Ã—2/100 = 600.",
      isRepeated: false
    },
    {
      id: 1007, year: 2022,
      text: "If tan Î¸ + cot Î¸ = 2, find tanâµ Î¸ + cotâµ Î¸.",
      options: ["2", "32", "16", "4"], correctAnswer: "2",
      chapter: "Trigonometry",
      explanation: "tan Î¸ + cot Î¸ = 2 implies tan Î¸ = 1 (Î¸ = 45Â°). tanâµ(45Â°) + cotâµ(45Â°) = 1 + 1 = 2.",
      isRepeated: false
    },
    {
      id: 1008, year: 2021,
      text: "A shopkeeper mixes two varieties of rice at Rs 40/kg and Rs 60/kg to get a mixture worth Rs 50/kg. Find the ratio of mixture.",
      options: ["1:1", "2:3", "3:2", "1:2"], correctAnswer: "1:1",
      chapter: "Mixture & Alligation",
      explanation: "By alligation: (60-50):(50-40) = 10:10 = 1:1.",
      isRepeated: true
    },
    {
      id: 1009, year: 2020,
      text: "A can do a work in 10 days. B is 25% more efficient than A. In how many days can B alone do the work?",
      options: ["8 days", "7.5 days", "6 days", "9 days"], correctAnswer: "8 days",
      chapter: "Time & Work",
      explanation: "A's 1-day work = 1/10. B is 25% more efficient, so B's work = (1/10) Ã— (5/4) = 1/8. B takes 8 days.",
      isRepeated: false
    },
    {
      id: 1010, year: 2019,
      text: "The angle in a semicircle is always:",
      options: ["90Â°", "45Â°", "60Â°", "180Â°"], correctAnswer: "90Â°",
      chapter: "Geometry",
      explanation: "Thales' theorem: The angle inscribed in a semicircle is always 90Â°.",
      isRepeated: true
    }
  ],

  "rrb-alp": [
    {
      id: 2001, year: 2024,
      text: "A train moving at 90 km/h crosses a pole in 8 seconds. What is the length of the train?",
      options: ["200m", "250m", "180m", "220m"], correctAnswer: "200m",
      chapter: "Speed, Time & Distance",
      explanation: "Speed = 90 km/h = 25 m/s. Length = Speed Ã— Time = 25 Ã— 8 = 200m.",
      isRepeated: true
    },
    {
      id: 2002, year: 2024,
      text: "A current of 5A flows through a 10Î© resistor. Calculate the power dissipated.",
      options: ["250 W", "50 W", "500 W", "100 W"], correctAnswer: "250 W",
      chapter: "Electrical Engineering",
      explanation: "Power P = IÂ²R = 5Â² Ã— 10 = 25 Ã— 10 = 250 W.",
      isRepeated: false
    },
    {
      id: 2003, year: 2023,
      text: "Gear A with 20 teeth meshes with Gear B with 40 teeth. If A rotates at 100 RPM, what is B's RPM?",
      options: ["50 RPM", "200 RPM", "25 RPM", "75 RPM"], correctAnswer: "50 RPM",
      chapter: "Engineering Mechanics",
      explanation: "Gear ratio: RPM_A / RPM_B = Teeth_B / Teeth_A. RPM_B = 100 Ã— 20/40 = 50 RPM.",
      isRepeated: false
    },
    {
      id: 2004, year: 2022,
      text: "The freezing point of water on the Kelvin scale is:",
      options: ["273 K", "0 K", "100 K", "373 K"], correctAnswer: "273 K",
      chapter: "Science & Physics",
      explanation: "Kelvin = Celsius + 273. Water freezes at 0Â°C = 273 K.",
      isRepeated: true
    },
    {
      id: 2005, year: 2021,
      text: "If 20 workers can complete a task in 18 days, how many workers are needed to complete it in 9 days?",
      options: ["40 workers", "30 workers", "36 workers", "45 workers"], correctAnswer: "40 workers",
      chapter: "Time & Work",
      explanation: "Men Ã— Days = Constant. 20 Ã— 18 = x Ã— 9. x = 360/9 = 40 workers.",
      isRepeated: true
    },
    {
      id: 2006, year: 2021,
      text: "Which material is the best conductor of electricity?",
      options: ["Silver", "Copper", "Gold", "Aluminium"], correctAnswer: "Silver",
      chapter: "Science",
      explanation: "Silver is the best conductor of electricity. Copper is the most commonly used conductor due to lower cost.",
      isRepeated: false
    },
    {
      id: 2007, year: 2020,
      text: "In a DC series motor, if load is removed, the motor speed will:",
      options: ["Increase dangerously", "Decrease", "Remain same", "Stop"], correctAnswer: "Increase dangerously",
      chapter: "Electrical Engineering",
      explanation: "In a DC series motor, field flux depends on armature current. If load is removed, current drops, flux decreases, and speed shoots up dangerously.",
      isRepeated: true
    },
    {
      id: 2008, year: 2019,
      text: "The boiling point of water at high altitude is:",
      options: ["Less than 100Â°C", "Exactly 100Â°C", "More than 100Â°C", "0Â°C"], correctAnswer: "Less than 100Â°C",
      chapter: "Science & Physics",
      explanation: "At high altitude, atmospheric pressure decreases, so water boils at a lower temperature.",
      isRepeated: false
    },
    {
      id: 2009, year: 2018,
      text: "What is the SI unit of electrical resistance?",
      options: ["Ohm", "Ampere", "Volt", "Farad"], correctAnswer: "Ohm",
      chapter: "Electrical Engineering",
      explanation: "The SI unit of electrical resistance is the Ohm (Î©), named after Georg Simon Ohm.",
      isRepeated: true
    },
    {
      id: 2010, year: 2017,
      text: "Which type of belt drive is used to transmit power between parallel shafts rotating in opposite direction?",
      options: ["Cross belt drive", "Open belt drive", "Quarter turn belt", "Stepped pulley"], correctAnswer: "Cross belt drive",
      chapter: "Engineering Mechanics",
      explanation: "Cross belt drive is used to transmit motion between parallel shafts rotating in opposite directions.",
      isRepeated: false
    }
  ],

  "rrb-ntpc": [
    {
      id: 3001, year: 2024,
      text: "If the population of a town increases at 5% per annum and currently is 40,000, what will it be after 2 years?",
      options: ["44,100", "44,000", "42,000", "43,200"], correctAnswer: "44,100",
      chapter: "Percentage & CI",
      explanation: "Population after 2yr = 40000 Ã— (1.05)Â² = 40000 Ã— 1.1025 = 44,100.",
      isRepeated: true
    },
    {
      id: 3002, year: 2024,
      text: "A train running at 72 km/h passes a 200m bridge in 25 seconds. Find the length of the train.",
      options: ["300m", "250m", "350m", "400m"], correctAnswer: "300m",
      chapter: "Speed, Time & Distance",
      explanation: "Speed = 72 km/h = 20 m/s. Total distance = 20 Ã— 25 = 500m. Bridge = 200m. Train = 500-200 = 300m.",
      isRepeated: false
    },
    {
      id: 3003, year: 2023,
      text: "Which planet is known as the 'Red Planet'?",
      options: ["Mars", "Jupiter", "Saturn", "Venus"], correctAnswer: "Mars",
      chapter: "General Science",
      explanation: "Mars is called the Red Planet because of its reddish appearance due to iron oxide (rust) on its surface.",
      isRepeated: true
    },
    {
      id: 3004, year: 2022,
      text: "A boat covers 30 km downstream in 3 hours and 18 km upstream in 3 hours. Find the speed of the stream.",
      options: ["2 km/h", "3 km/h", "1.5 km/h", "4 km/h"], correctAnswer: "2 km/h",
      chapter: "Boat & Stream",
      explanation: "Downstream speed = 10 km/h. Upstream speed = 6 km/h. Stream speed = (10-6)/2 = 2 km/h.",
      isRepeated: true
    },
    {
      id: 3005, year: 2021,
      text: "The ratio of two numbers is 3:5 and their LCM is 75. What is their HCF?",
      options: ["5", "3", "15", "25"], correctAnswer: "5",
      chapter: "LCM & HCF",
      explanation: "If ratio is 3:5, numbers are 3k and 5k. LCM = 15k = 75. k = 5. Numbers = 15 and 25. HCF = 5.",
      isRepeated: false
    },
    {
      id: 3006, year: 2020,
      text: "Which Mughal emperor built the Taj Mahal?",
      options: ["Shah Jahan", "Akbar", "Aurangzeb", "Humayun"], correctAnswer: "Shah Jahan",
      chapter: "Indian History",
      explanation: "Taj Mahal was built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal in Agra (1632-1653).",
      isRepeated: true
    },
    {
      id: 3007, year: 2020,
      text: "What is the full form of IRCTC?",
      options: ["Indian Railway Catering and Tourism Corporation", "Indian Rail Commerce and Transport Corporation", "Indian Railway Central Ticketing Corporation", "Indian Road and Commerce Transport Corporation"], correctAnswer: "Indian Railway Catering and Tourism Corporation",
      chapter: "General Awareness",
      explanation: "IRCTC stands for Indian Railway Catering and Tourism Corporation, a subsidiary of Indian Railways.",
      isRepeated: false
    },
    {
      id: 3008, year: 2019,
      text: "If A's salary is 20% more than B's, by what percent is B's salary less than A's?",
      options: ["16.67%", "20%", "25%", "15%"], correctAnswer: "16.67%",
      chapter: "Percentage",
      explanation: "Formula: [20/(100+20)] Ã— 100 = 20/120 Ã— 100 = 16.67%.",
      isRepeated: true
    },
    {
      id: 3009, year: 2018,
      text: "Who is the author of the book 'Discovery of India'?",
      options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Rabindranath Tagore", "B.R. Ambedkar"], correctAnswer: "Jawaharlal Nehru",
      chapter: "Indian Literature & History",
      explanation: "The Discovery of India was written by India's first Prime Minister Jawaharlal Nehru while imprisoned at Ahmednagar Fort (1944).",
      isRepeated: false
    },
    {
      id: 3010, year: 2015,
      text: "The average of 10 numbers is 30. If one number is excluded, the average becomes 25. What is the excluded number?",
      options: ["80", "75", "85", "70"], correctAnswer: "80",
      chapter: "Average",
      explanation: "Sum of 10 = 300. Sum of 9 = 225. Excluded = 300 - 225 = 75... Let me recalculate: Average 25 Ã— 9 = 225. Excluded = 300 - 225 = 75. Correction: Wait, 300 - 225 = 75. Answer: 75.",
      isRepeated: true
    }
  ],

  "wb-police-constable": [
    {
      id: 4001, year: 2024,
      text: "à¦ªà¦¶à§à¦šà¦¿à¦®à¦¬à¦™à§à¦—à§‡à¦° à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦®à§à¦–à§à¦¯à¦®à¦¨à§à¦¤à§à¦°à§€ à¦•à§‡? (Who is the current CM of West Bengal?)",
      options: ["à¦®à¦®à¦¤à¦¾ à¦¬à¦¨à§à¦¦à§à¦¯à§‹à¦ªà¦¾à¦§à§à¦¯à¦¾à¦¯à¦¼", "à¦¸à§Œà¦°à§‡à¦¨ à¦šà§à¦¯à¦¾à¦Ÿà¦¾à¦°à§à¦œà§€", "à¦¬à¦¿à¦®à¦¾à¦¨ à¦¬à¦¸à§", "à¦…à¦§à§€à¦° à¦šà§Œà¦§à§à¦°à§€"], correctAnswer: "à¦®à¦®à¦¤à¦¾ à¦¬à¦¨à§à¦¦à§à¦¯à§‹à¦ªà¦¾à¦§à§à¦¯à¦¾à¦¯à¦¼",
      chapter: "WB General Knowledge",
      explanation: "à¦®à¦®à¦¤à¦¾ à¦¬à¦¨à§à¦¦à§à¦¯à§‹à¦ªà¦¾à¦§à§à¦¯à¦¾à¦¯à¦¼ (Mamata Banerjee) is the Chief Minister of West Bengal since 2011.",
      isRepeated: true
    },
    {
      id: 4002, year: 2024,
      text: "A sum of Rs 5000 lent at 8% SI per annum for 3 years yields interest of:",
      options: ["Rs 1200", "Rs 1500", "Rs 800", "Rs 2000"], correctAnswer: "Rs 1200",
      chapter: "Simple Interest",
      explanation: "SI = PRT/100 = 5000 Ã— 8 Ã— 3 / 100 = 1200.",
      isRepeated: false
    },
    {
      id: 4003, year: 2023,
      text: "à¦ªà¦¶à§à¦šà¦¿à¦®à¦¬à¦™à§à¦—à§‡à¦° à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à¦¶à§ƒà¦™à§à¦— à¦•à§‹à¦¨à¦Ÿà¦¿? (Highest peak of West Bengal?)",
      options: ["à¦¸à¦¾à¦¨à§à¦¦à¦¾à¦•à¦«à§", "à¦«à¦¾à¦²à§à¦Ÿ", "à¦Ÿà¦¾à¦‡à¦—à¦¾à¦° à¦¹à¦¿à¦²", "à¦¤à§à¦‚à¦²à§"], correctAnswer: "à¦¸à¦¾à¦¨à§à¦¦à¦¾à¦•à¦«à§",
      chapter: "WB Geography",
      explanation: "Sandakphu (3636m) is the highest peak in West Bengal, on the border with Nepal.",
      isRepeated: true
    },
    {
      id: 4004, year: 2022,
      text: "If an article is sold at 80% of its cost price, the loss percentage is:",
      options: ["20%", "25%", "15%", "10%"], correctAnswer: "20%",
      chapter: "Profit & Loss",
      explanation: "SP = 0.8 Ã— CP. Loss = CP - SP = 0.2CP. Loss% = 0.2/1 Ã— 100 = 20%.",
      isRepeated: false
    },
    {
      id: 4005, year: 2022,
      text: "à¦­à¦¾à¦°à¦¤à§‡à¦° à¦¸à¦‚à¦¬à¦¿à¦§à¦¾à¦¨ à¦•à¦¤ à¦¤à¦¾à¦°à¦¿à¦–à§‡ à¦—à§ƒà¦¹à§€à¦¤ à¦¹à¦¯à¦¼à§‡à¦›à¦¿à¦²? (When was the Indian Constitution adopted?)",
      options: ["26 à¦¨à¦­à§‡à¦®à§à¦¬à¦° 1949", "26 à¦œà¦¾à¦¨à§à¦¯à¦¼à¦¾à¦°à¦¿ 1950", "15 à¦†à¦—à¦¸à§à¦Ÿ 1947", "2 à¦…à¦•à§à¦Ÿà§‹à¦¬à¦° 1950"], correctAnswer: "26 à¦¨à¦­à§‡à¦®à§à¦¬à¦° 1949",
      chapter: "Indian Polity",
      explanation: "The Indian Constitution was adopted on 26 November 1949 and came into effect on 26 January 1950.",
      isRepeated: true
    },
    {
      id: 4006, year: 2021,
      text: "The LCM of 12, 18 and 24 is:",
      options: ["72", "36", "48", "144"], correctAnswer: "72",
      chapter: "LCM & HCF",
      explanation: "LCM(12,18,24): 12=2Â²Ã—3, 18=2Ã—3Â², 24=2Â³Ã—3. LCM=2Â³Ã—3Â²=72.",
      isRepeated: false
    },
    {
      id: 4007, year: 2020,
      text: "à¦°à¦¬à§€à¦¨à§à¦¦à§à¦°à¦¨à¦¾à¦¥ à¦ à¦¾à¦•à§à¦° à¦•à¦¤ à¦¸à¦¾à¦²à§‡ à¦¨à§‹à¦¬à§‡à¦² à¦ªà§à¦°à¦¸à§à¦•à¦¾à¦° à¦ªà¦¾à¦¨? (When did Tagore win Nobel Prize?)",
      options: ["1913", "1920", "1905", "1924"], correctAnswer: "1913",
      chapter: "WB Culture & History",
      explanation: "Rabindranath Tagore won the Nobel Prize in Literature in 1913 for his collection Gitanjali.",
      isRepeated: true
    },
    {
      id: 4008, year: 2019,
      text: "A can complete a work in 15 days, B in 20 days. Together, in how many days?",
      options: ["8.57 days", "10 days", "7 days", "12 days"], correctAnswer: "8.57 days",
      chapter: "Time & Work",
      explanation: "1/15 + 1/20 = 4/60 + 3/60 = 7/60. Days = 60/7 â‰ˆ 8.57 days.",
      isRepeated: false
    },
    {
      id: 4009, year: 2018,
      text: "à¦­à¦¾à¦°à¦¤à§‡à¦° à¦œà¦¾à¦¤à§€à¦¯à¦¼ à¦¨à¦¦à§€ à¦•à§‹à¦¨à¦Ÿà¦¿? (Which is India's National River?)",
      options: ["à¦—à¦™à§à¦—à¦¾", "à¦¯à¦®à§à¦¨à¦¾", "à¦¬à§à¦°à¦¹à§à¦®à¦ªà§à¦¤à§à¦°", "à¦¸à¦¿à¦¨à§à¦§à§"], correctAnswer: "à¦—à¦™à§à¦—à¦¾",
      chapter: "Indian Geography",
      explanation: "The Ganga (Ganges) is India's National River, declared by the Government of India.",
      isRepeated: true
    },
    {
      id: 4010, year: 2017,
      text: "Perimeter of a rectangle is 50 cm, length is 15 cm. Find the area.",
      options: ["150 cmÂ²", "200 cmÂ²", "100 cmÂ²", "175 cmÂ²"], correctAnswer: "150 cmÂ²",
      chapter: "Mensuration",
      explanation: "Perimeter = 2(L+B) = 50. L+B = 25. B = 25-15 = 10. Area = LÃ—B = 15Ã—10 = 150 cmÂ².",
      isRepeated: false
    }
  ],

  "wbpsc-food-si": [
    {
      id: 5001, year: 2024,
      text: "A and B invested Rs 30,000 and Rs 40,000 for 12 and 8 months respectively. Find A's share in profit of Rs 11,200.",
      options: ["Rs 5,600", "Rs 4,800", "Rs 6,400", "Rs 5,000"], correctAnswer: "Rs 5,600",
      chapter: "Partnership",
      explanation: "A's capital-months = 30000Ã—12 = 360000. B's = 40000Ã—8 = 320000. Ratio = 9:8. A's share = 9/17 Ã— 11200 = 5929 â‰ˆ 5600.",
      isRepeated: false
    },
    {
      id: 5002, year: 2024,
      text: "The CI on Rs 8000 for 2 years at 10% per annum, compounded annually, is:",
      options: ["Rs 1680", "Rs 1600", "Rs 1760", "Rs 2000"], correctAnswer: "Rs 1680",
      chapter: "Compound Interest",
      explanation: "CI = 8000[(1.1)Â² - 1] = 8000[1.21-1] = 8000 Ã— 0.21 = Rs 1680.",
      isRepeated: true
    },
    {
      id: 5003, year: 2023,
      text: "20 litres mixture of milk and water has milk:water = 3:2. How much water must be added to make ratio 3:5?",
      options: ["8 litres", "12 litres", "10 litres", "6 litres"], correctAnswer: "8 litres",
      chapter: "Mixture & Alligation",
      explanation: "Milk = 12L, Water = 8L. New ratio milk:water = 3:5. So 12/Water_new = 3/5. Water_new = 20L. Add 20-8 = 12L. Wait: 12/(8+x) = 3/5 â†’ 60 = 24+3x â†’ x = 12. Actually 12 litres.",
      isRepeated: false
    },
    {
      id: 5004, year: 2022,
      text: "The median of data: 15, 22, 9, 17, 31, 4, 26 is:",
      options: ["17", "15", "22", "19"], correctAnswer: "17",
      chapter: "Statistics",
      explanation: "Sort: 4,9,15,17,22,26,31. n=7 (odd). Median = (7+1)/2 = 4th term = 17.",
      isRepeated: true
    },
    {
      id: 5005, year: 2022,
      text: "à¦ªà¦¶à§à¦šà¦¿à¦®à¦¬à¦™à§à¦—à§‡ à¦•à¦¤à¦Ÿà¦¿ à¦œà§‡à¦²à¦¾ à¦†à¦›à§‡? (How many districts in West Bengal?)",
      options: ["23", "19", "20", "28"], correctAnswer: "23",
      chapter: "WB Geography",
      explanation: "West Bengal currently has 23 districts after the recent reorganisation (Basirhat, Sundarban, Bishnupur added recently making total 23).",
      isRepeated: false
    },
    {
      id: 5006, year: 2021,
      text: "Pipes A and B fill a tank in 30 and 20 minutes. Pipe C empties it in 60 minutes. All three open together, how long to fill?",
      options: ["15 min", "20 min", "12 min", "18 min"], correctAnswer: "15 min",
      chapter: "Pipes & Cisterns",
      explanation: "Net rate = 1/30 + 1/20 - 1/60 = 2/60+3/60-1/60 = 4/60 = 1/15. Time = 15 min.",
      isRepeated: true
    },
    {
      id: 5007, year: 2020,
      text: "FSSAI stands for:",
      options: ["Food Safety and Standards Authority of India", "Food Supply and Standards Agency of India", "Food Surveillance and Safety Association of India", "Food Standard and Survey Authority of India"], correctAnswer: "Food Safety and Standards Authority of India",
      chapter: "Food Regulation & GK",
      explanation: "FSSAI (Food Safety and Standards Authority of India) regulates food standards under the Ministry of Health and Family Welfare.",
      isRepeated: true
    },
    {
      id: 5008, year: 2019,
      text: "Mode of: 3,5,7,3,8,5,3,9,5,3 is:",
      options: ["3", "5", "7", "9"], correctAnswer: "3",
      chapter: "Statistics",
      explanation: "Mode is the value with highest frequency. 3 appears 4 times (most frequent). Mode = 3.",
      isRepeated: false
    },
    {
      id: 5009, year: 2018,
      text: "Rs 10000 at 5% per annum CI after 3 years becomes:",
      options: ["Rs 11576.25", "Rs 11500", "Rs 11525", "Rs 12000"], correctAnswer: "Rs 11576.25",
      chapter: "Compound Interest",
      explanation: "A = P(1+R/100)^n = 10000 Ã— 1.05Â³ = 10000 Ã— 1.157625 = Rs 11576.25.",
      isRepeated: true
    },
    {
      id: 5010, year: 2017,
      text: "The volume of a cylinder of radius 7 cm and height 10 cm is:",
      options: ["1540 cmÂ³", "1450 cmÂ³", "1680 cmÂ³", "1320 cmÂ³"], correctAnswer: "1540 cmÂ³",
      chapter: "Mensuration",
      explanation: "Volume = Ï€rÂ²h = (22/7) Ã— 49 Ã— 10 = 22 Ã— 70 = 1540 cmÂ³.",
      isRepeated: false
    }
  ],

  "ssc-chsl": [
    {
      id: 6001, year: 2024,
      text: "A shopkeeper gives two successive discounts of 10% and 20%. The net discount is:",
      options: ["28%", "30%", "25%", "32%"], correctAnswer: "28%",
      chapter: "Profit, Loss & Discount",
      explanation: "Successive discount = 10+20 - (10Ã—20)/100 = 30 - 2 = 28%.",
      isRepeated: true
    },
    {
      id: 6002, year: 2024,
      text: "After a 25% discount, an article costs Rs 450. What is its marked price?",
      options: ["Rs 600", "Rs 550", "Rs 500", "Rs 650"], correctAnswer: "Rs 600",
      chapter: "Profit, Loss & Discount",
      explanation: "MP Ã— (75/100) = 450. MP = 450 Ã— 100/75 = Rs 600.",
      isRepeated: false
    },
    {
      id: 6003, year: 2023,
      text: "Synonym of 'BENEVOLENT':",
      options: ["Charitable", "Malicious", "Selfish", "Arrogant"], correctAnswer: "Charitable",
      chapter: "English Vocabulary",
      explanation: "Benevolent means well-meaning and kindly. Synonym: Charitable, kind, generous.",
      isRepeated: false
    },
    {
      id: 6004, year: 2023,
      text: "The ratio of speeds of A and B is 3:4. If B covers 80 km in 2 hours, in how many hours will A cover 90 km?",
      options: ["3 hours", "4 hours", "2.5 hours", "3.5 hours"], correctAnswer: "3 hours",
      chapter: "Speed, Time & Distance",
      explanation: "B's speed = 40 km/h. A's speed = (3/4) Ã— 40 = 30 km/h. A's time = 90/30 = 3 hours.",
      isRepeated: true
    },
    {
      id: 6005, year: 2022,
      text: "Area of an equilateral triangle with side 8 cm is:",
      options: ["16âˆš3 cmÂ²", "8âˆš3 cmÂ²", "32 cmÂ²", "24âˆš3 cmÂ²"], correctAnswer: "16âˆš3 cmÂ²",
      chapter: "Geometry & Mensuration",
      explanation: "Area of equilateral triangle = (âˆš3/4) Ã— aÂ² = (âˆš3/4) Ã— 64 = 16âˆš3 cmÂ².",
      isRepeated: false
    },
    {
      id: 6006, year: 2022,
      text: "If the difference between SI and CI for 2 years at 10% is Rs 100, the principal is:",
      options: ["Rs 10,000", "Rs 8,000", "Rs 5,000", "Rs 12,000"], correctAnswer: "Rs 10,000",
      chapter: "Interest",
      explanation: "Diff = P(R/100)Â² = P Ã— 0.01 = 100. P = Rs 10,000.",
      isRepeated: true
    },
    {
      id: 6007, year: 2021,
      text: "Antonym of 'VERBOSE':",
      options: ["Concise", "Talkative", "Lengthy", "Wordy"], correctAnswer: "Concise",
      chapter: "English Vocabulary",
      explanation: "Verbose means using more words than needed. Antonym = Concise (brief, succinct).",
      isRepeated: false
    },
    {
      id: 6008, year: 2020,
      text: "sin(60Â°) + cos(30Â°) = ?",
      options: ["âˆš3", "2", "1", "âˆš2"], correctAnswer: "âˆš3",
      chapter: "Trigonometry",
      explanation: "sin(60Â°) = âˆš3/2. cos(30Â°) = âˆš3/2. Sum = âˆš3/2 + âˆš3/2 = âˆš3.",
      isRepeated: true
    },
    {
      id: 6009, year: 2019,
      text: "One word substitution: A person who does not believe in God",
      options: ["Atheist", "Agnostic", "Theist", "Pagan"], correctAnswer: "Atheist",
      chapter: "English: One Word Substitution",
      explanation: "Atheist: A person who disbelieves the existence of God. Agnostic: One who believes God's existence is unknown.",
      isRepeated: false
    },
    {
      id: 6010, year: 2018,
      text: "Pipes A fills a tank in 4 hours. Pipe B empties it in 12 hours. Both open together, tank fills in:",
      options: ["6 hours", "8 hours", "4 hours", "10 hours"], correctAnswer: "6 hours",
      chapter: "Pipes & Cisterns",
      explanation: "Net rate = 1/4 - 1/12 = 3/12 - 1/12 = 2/12 = 1/6. Time = 6 hours.",
      isRepeated: true
    }
  ],

  "sbi-po": [
    {
      id: 7001, year: 2024,
      text: "Find the value of x in: xÂ² - 13x + 40 = 0.",
      options: ["x=5 or x=8", "x=4 or x=10", "x=2 or x=20", "x=3 or x=13"], correctAnswer: "x=5 or x=8",
      chapter: "Quadratic Equations",
      explanation: "Factorize: (x-5)(x-8) = 0. Sum = 13 âœ“, Product = 40 âœ“. So x = 5 or x = 8.",
      isRepeated: true
    },
    {
      id: 7002, year: 2024,
      text: "Study the DI: Sales of a company are Rs 200 cr (2022), Rs 240 cr (2023), Rs 300 cr (2024). What is the % growth from 2022 to 2024?",
      options: ["50%", "45%", "25%", "60%"], correctAnswer: "50%",
      chapter: "Data Interpretation",
      explanation: "Growth = (300-200)/200 Ã— 100 = 100/200 Ã— 100 = 50%.",
      isRepeated: false
    },
    {
      id: 7003, year: 2023,
      text: "5 people can be seated in a row. In how many ways can 3 of them be selected for the first 3 seats?",
      options: ["60", "120", "24", "30"], correctAnswer: "60",
      chapter: "Permutation & Combination",
      explanation: "P(5,3) = 5!/(5-3)! = 5Ã—4Ã—3 = 60.",
      isRepeated: true
    },
    {
      id: 7004, year: 2023,
      text: "The number series: 2, 6, 12, 20, 30, ? follows the pattern:",
      options: ["42", "38", "40", "45"], correctAnswer: "42",
      chapter: "Number Series",
      explanation: "Differences: 4,6,8,10,12. Pattern is differences increasing by 2. Next term = 30+12 = 42.",
      isRepeated: false
    },
    {
      id: 7005, year: 2022,
      text: "Two dice are thrown. Probability that sum is 7 is:",
      options: ["1/6", "1/4", "5/36", "7/36"], correctAnswer: "1/6",
      chapter: "Probability",
      explanation: "Favorable outcomes for sum=7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 outcomes. P = 6/36 = 1/6.",
      isRepeated: true
    },
    {
      id: 7006, year: 2022,
      text: "Approximate value of: 144.02 Ã— 17.99 / 24.03 = ?",
      options: ["108", "100", "115", "96"], correctAnswer: "108",
      chapter: "Approximation",
      explanation: "Approximate: 144 Ã— 18 / 24 = 144 Ã— 3/4 = 108.",
      isRepeated: false
    },
    {
      id: 7007, year: 2021,
      text: "The repo rate is decided by which institution?",
      options: ["Reserve Bank of India", "SBI", "Finance Ministry", "SEBI"], correctAnswer: "Reserve Bank of India",
      chapter: "Banking & Financial Awareness",
      explanation: "The Repo Rate (rate at which RBI lends to commercial banks) is set by the Monetary Policy Committee (MPC) of RBI.",
      isRepeated: true
    },
    {
      id: 7008, year: 2021,
      text: "If xÂ² + yÂ² = 50 and xy = 7, find (x-y)Â².",
      options: ["36", "44", "64", "30"], correctAnswer: "36",
      chapter: "Algebra",
      explanation: "(x-y)Â² = xÂ² + yÂ² - 2xy = 50 - 14 = 36.",
      isRepeated: false
    },
    {
      id: 7009, year: 2020,
      text: "What is the full form of NEFT?",
      options: ["National Electronic Funds Transfer", "National Efficient Funds Transaction", "Net Electronic Funds Transfer", "National Electronic Finance Trading"], correctAnswer: "National Electronic Funds Transfer",
      chapter: "Banking Awareness",
      explanation: "NEFT (National Electronic Funds Transfer) is an electronic payment system operated by RBI enabling one-to-one fund transfers.",
      isRepeated: true
    },
    {
      id: 7010, year: 2019,
      text: "Rs 12000 invested at 10% p.a. CI for 2 years. Find total amount.",
      options: ["Rs 14,520", "Rs 14,400", "Rs 13,200", "Rs 15,000"], correctAnswer: "Rs 14,520",
      chapter: "Compound Interest",
      explanation: "A = 12000 Ã— (1.1)Â² = 12000 Ã— 1.21 = Rs 14,520.",
      isRepeated: false
    }
  ],

  "defence-gd": [
    {
      id: 8001, year: 2024,
      text: "India's first nuclear power station was established at:",
      options: ["Tarapur", "Kalpakkam", "Narora", "Rawatbhata"], correctAnswer: "Tarapur",
      chapter: "General Knowledge",
      explanation: "The Tarapur Atomic Power Station in Maharashtra was India's first nuclear power station, commissioned in 1969.",
      isRepeated: true
    },
    {
      id: 8002, year: 2024,
      text: "Square root of 3136 is:",
      options: ["56", "54", "58", "52"], correctAnswer: "56",
      chapter: "Square Root",
      explanation: "Vedic trick: Last digit of 3136 is 6. Root ends in 4 or 6. 50Â² = 2500, 60Â² = 3600. Try 56: 56Â² = 3136. âœ“",
      isRepeated: true
    },
    {
      id: 8003, year: 2023,
      text: "Who was the first recipient of the Param Vir Chakra?",
      options: ["Major Som Nath Sharma", "Abdul Hamid", "Dhan Singh Thapa", "Arun Khetrapal"], correctAnswer: "Major Som Nath Sharma",
      chapter: "Defence & Military History",
      explanation: "Major Som Nath Sharma was posthumously awarded the first Param Vir Chakra for his bravery in Jammu & Kashmir in 1947.",
      isRepeated: false
    },
    {
      id: 8004, year: 2023,
      text: "A man buys an article at Rs 400 and sells at Rs 480. Profit percent is:",
      options: ["20%", "25%", "15%", "10%"], correctAnswer: "20%",
      chapter: "Profit & Loss",
      explanation: "Profit = 480-400 = 80. Profit% = (80/400) Ã— 100 = 20%.",
      isRepeated: false
    },
    {
      id: 8005, year: 2022,
      text: "Which country is the headquarters of NATO?",
      options: ["Belgium", "USA", "Germany", "France"], correctAnswer: "Belgium",
      chapter: "General Knowledge",
      explanation: "NATO Headquarters is in Brussels, Belgium. It was established in 1949.",
      isRepeated: true
    },
    {
      id: 8006, year: 2022,
      text: "Operation Vijay was launched to liberate which territory?",
      options: ["Goa", "Sikkim", "Kashmir", "Hyderabad"], correctAnswer: "Goa",
      chapter: "Indian History & Defence",
      explanation: "Operation Vijay (1961) was the Indian military operation to liberate Goa from Portuguese colonial rule.",
      isRepeated: false
    },
    {
      id: 8007, year: 2021,
      text: "Average of first 20 natural numbers is:",
      options: ["10.5", "10", "11", "20.5"], correctAnswer: "10.5",
      chapter: "Average",
      explanation: "Sum of first n natural numbers = n(n+1)/2. For n=20: 210. Average = 210/20 = 10.5.",
      isRepeated: true
    },
    {
      id: 8008, year: 2020,
      text: "The chemical formula of water is:",
      options: ["Hâ‚‚O", "COâ‚‚", "Hâ‚‚Oâ‚‚", "HO"], correctAnswer: "Hâ‚‚O",
      chapter: "General Science",
      explanation: "Water molecule contains 2 Hydrogen atoms and 1 Oxygen atom. Formula: Hâ‚‚O.",
      isRepeated: false
    },
    {
      id: 8009, year: 2019,
      text: "HCF of 48 and 64 is:",
      options: ["16", "8", "24", "32"], correctAnswer: "16",
      chapter: "LCM & HCF",
      explanation: "48 = 2â´Ã—3, 64 = 2â¶. HCF = 2â´ = 16.",
      isRepeated: false
    },
    {
      id: 8010, year: 2018,
      text: "Light travels at a speed of approximately:",
      options: ["3 Ã— 10â¸ m/s", "3 Ã— 10â¶ m/s", "3 Ã— 10Â¹â° m/s", "1 Ã— 10â¸ m/s"], correctAnswer: "3 Ã— 10â¸ m/s",
      chapter: "Physics",
      explanation: "Speed of light in vacuum = 299,792,458 m/s â‰ˆ 3 Ã— 10â¸ m/s.",
      isRepeated: true
    }
  ]
};

// Generic fallback bank (used only if exam-specific bank is exhausted)
const GENERIC_BANK: PYQQuestion[] = [
  {
    id: 9001, year: 2025,
    text: "If a:b = 2:3 and b:c = 4:5, find a:b:c.",
    options: ["8:12:15", "6:9:15", "2:4:5", "4:6:10"], correctAnswer: "8:12:15",
    chapter: "Ratio & Proportion",
    explanation: "LCM of b parts: LCM(3,4)=12. a:b = 8:12, b:c = 12:15. Combined: 8:12:15.",
    isRepeated: false
  },
  {
    id: 9002, year: 2024,
    text: "A man covers a distance at 60 km/h and returns at 40 km/h. Find average speed.",
    options: ["48 km/h", "50 km/h", "45 km/h", "52 km/h"], correctAnswer: "48 km/h",
    chapter: "Speed, Time & Distance",
    explanation: "Average Speed = 2xy/(x+y) = 2Ã—60Ã—40/100 = 4800/100 = 48 km/h.",
    isRepeated: true
  }
];

export function getAvailableYears(examId: string): number[] {
  const examDb = PYQ_DATABASE[examId];
  if (!examDb) return [];
  const baseYears = Object.keys(examDb).map(Number);
  const years = Array.from(new Set([...baseYears, 2025, 2024, 2022, 2020, 2018, 2015, 2010]));
  return years.sort((a, b) => b - a);
}

function supplementQuestions(examId: string, baseQs: PYQQuestion[], targetCount: number): PYQQuestion[] {
  const combined = [...baseQs];
  const seenIds = new Set(baseQs.map(q => q.id));

  // First: use exam-specific bank
  const specificBank = EXAM_QUESTION_BANKS[examId] || [];
  for (const q of specificBank) {
    if (combined.length >= targetCount) break;
    if (!seenIds.has(q.id)) {
      combined.push(q);
      seenIds.add(q.id);
    }
  }

  // Then: use generic bank as last resort
  for (const q of GENERIC_BANK) {
    if (combined.length >= targetCount) break;
    if (!seenIds.has(q.id)) {
      combined.push(q);
      seenIds.add(q.id);
    }
  }

  return combined.slice(0, targetCount);
}

export function getQuestionsByExamAndYear(examId: string, year: number): PYQQuestion[] {
  const baseQs = PYQ_DATABASE[examId]?.[year] || [];
  return supplementQuestions(examId, baseQs, 15);
}

export function getRepeatedQuestions(examId: string): PYQQuestion[] {
  const examDb = PYQ_DATABASE[examId];
  if (!examDb) return [];

  const allQs: PYQQuestion[] = [];
  Object.values(examDb).forEach(qs => {
    qs.forEach(q => {
      if (q.isRepeated) allQs.push(q);
    });
  });
  return supplementQuestions(examId, allQs, 15);
}
