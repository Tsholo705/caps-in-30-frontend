// Prototype / curriculum-draft content for Team Mode.
// Each card has a term to describe and forbidden words the describer may NOT say.

export const CARDS = [
  // ---------- Mathematics ----------
  {
    id: 1,
    grade: 7,
    subject: "Mathematics",
    topic: "Geometry",
    term: "Triangle",
    forbiddenWords: ["Three", "Sides", "Shape", "Angle", "Corners"],
    points: 1,
  },
  {
    id: 2,
    grade: 7,
    subject: "Mathematics",
    topic: "Fractions",
    term: "Denominator",
    forbiddenWords: ["Bottom", "Fraction", "Number", "Line", "Divide"],
    points: 1,
  },
  {
    id: 3,
    grade: 7,
    subject: "Mathematics",
    topic: "Whole Numbers",
    term: "Prime Number",
    forbiddenWords: ["Two", "Factors", "Divide", "One", "Itself"],
    points: 1,
  },
  {
    id: 4,
    grade: 7,
    subject: "Mathematics",
    topic: "Geometry",
    term: "Perimeter",
    forbiddenWords: ["Around", "Outside", "Add", "Shape", "Length"],
    points: 1,
  },
  {
    id: 5,
    grade: 7,
    subject: "Mathematics",
    topic: "Whole Numbers",
    term: "Multiple",
    forbiddenWords: ["Times", "Table", "Multiply", "Product", "Skip"],
    points: 1,
  },
  {
    id: 6,
    grade: 8,
    subject: "Mathematics",
    topic: "Algebra Basics",
    term: "Variable",
    forbiddenWords: ["Letter", "x", "Unknown", "Value", "Algebra"],
    points: 1,
  },
  {
    id: 7,
    grade: 8,
    subject: "Mathematics",
    topic: "Algebra Basics",
    term: "Equation",
    forbiddenWords: ["Equals", "Solve", "Balance", "Sum", "Sign"],
    points: 1,
  },
  {
    id: 8,
    grade: 8,
    subject: "Mathematics",
    topic: "Geometry",
    term: "Parallel Lines",
    forbiddenWords: ["Never", "Meet", "Straight", "Same", "Distance"],
    points: 1,
  },
  {
    id: 9,
    grade: 8,
    subject: "Mathematics",
    topic: "Geometry",
    term: "Circumference",
    forbiddenWords: ["Circle", "Around", "Pi", "Distance", "Edge"],
    points: 1,
  },
  {
    id: 10,
    grade: 8,
    subject: "Mathematics",
    topic: "Fractions",
    term: "Percentage",
    forbiddenWords: ["Hundred", "Percent", "Out of", "Fraction", "Sign"],
    points: 1,
  },

  // ---------- Natural Sciences ----------
  {
    id: 11,
    grade: 7,
    subject: "Natural Sciences",
    topic: "Life and Living",
    term: "Photosynthesis",
    forbiddenWords: ["Plant", "Sunlight", "Food", "Leaf", "Oxygen"],
    points: 1,
  },
  {
    id: 12,
    grade: 7,
    subject: "Natural Sciences",
    topic: "Matter and Materials",
    term: "Evaporation",
    forbiddenWords: ["Liquid", "Gas", "Heat", "Water", "Steam"],
    points: 1,
  },
  {
    id: 13,
    grade: 7,
    subject: "Natural Sciences",
    topic: "Life and Living",
    term: "Cell",
    forbiddenWords: ["Small", "Living", "Building block", "Microscope", "Body"],
    points: 1,
  },
  {
    id: 14,
    grade: 7,
    subject: "Natural Sciences",
    topic: "Energy and Change",
    term: "Solar Panel",
    forbiddenWords: ["Sun", "Electricity", "Roof", "Energy", "Light"],
    points: 1,
  },
  {
    id: 15,
    grade: 7,
    subject: "Natural Sciences",
    topic: "Matter and Materials",
    term: "Condensation",
    forbiddenWords: ["Gas", "Liquid", "Cool", "Droplets", "Window"],
    points: 1,
  },
  {
    id: 16,
    grade: 8,
    subject: "Natural Sciences",
    topic: "Matter and Materials",
    term: "Atom",
    forbiddenWords: ["Tiny", "Particle", "Element", "Electron", "Nucleus"],
    points: 1,
  },
  {
    id: 17,
    grade: 8,
    subject: "Natural Sciences",
    topic: "Energy and Change",
    term: "Circuit",
    forbiddenWords: ["Electricity", "Wire", "Battery", "Current", "Loop"],
    points: 1,
  },
  {
    id: 18,
    grade: 8,
    subject: "Natural Sciences",
    topic: "Life and Living",
    term: "Skeleton",
    forbiddenWords: ["Bones", "Body", "Support", "Skull", "Frame"],
    points: 1,
  },
  {
    id: 19,
    grade: 8,
    subject: "Natural Sciences",
    topic: "Matter and Materials",
    term: "Mixture",
    forbiddenWords: ["Mix", "Two", "Substances", "Combine", "Separate"],
    points: 1,
  },
  {
    id: 20,
    grade: 8,
    subject: "Natural Sciences",
    topic: "Energy and Change",
    term: "Friction",
    forbiddenWords: ["Rub", "Force", "Surface", "Slow", "Heat"],
    points: 1,
  },

  // ---------- Technology ----------
  {
    id: 21,
    grade: 7,
    subject: "Technology",
    topic: "Structures",
    term: "Bridge",
    forbiddenWords: ["Cross", "River", "Road", "Build", "Over"],
    points: 1,
  },
  {
    id: 22,
    grade: 7,
    subject: "Technology",
    topic: "Structures",
    term: "Compression",
    forbiddenWords: ["Squash", "Push", "Force", "Squeeze", "Together"],
    points: 1,
  },
  {
    id: 23,
    grade: 7,
    subject: "Technology",
    topic: "Processing",
    term: "Recycling",
    forbiddenWords: ["Waste", "Reuse", "Plastic", "Bin", "Again"],
    points: 1,
  },
  {
    id: 24,
    grade: 7,
    subject: "Technology",
    topic: "Systems and Control",
    term: "Input",
    forbiddenWords: ["Goes in", "System", "Start", "Output", "Process"],
    points: 1,
  },
  {
    id: 25,
    grade: 8,
    subject: "Technology",
    topic: "Systems and Control",
    term: "Gear",
    forbiddenWords: ["Wheel", "Teeth", "Turn", "Bicycle", "Speed"],
    points: 1,
  },
  {
    id: 26,
    grade: 8,
    subject: "Technology",
    topic: "Structures",
    term: "Foundation",
    forbiddenWords: ["Bottom", "Building", "Ground", "Concrete", "Support"],
    points: 1,
  },
  {
    id: 27,
    grade: 8,
    subject: "Technology",
    topic: "Processing",
    term: "Prototype",
    forbiddenWords: ["First", "Model", "Test", "Design", "Sample"],
    points: 1,
  },
  {
    id: 28,
    grade: 8,
    subject: "Technology",
    topic: "Systems and Control",
    term: "Lever",
    forbiddenWords: ["Simple machine", "Lift", "Pivot", "Bar", "Force"],
    points: 1,
  },

  // ---------- English Home Language ----------
  {
    id: 29,
    grade: 7,
    subject: "English Home Language",
    topic: "Grammar",
    term: "Adjective",
    forbiddenWords: ["Describe", "Noun", "Word", "Colour", "Big"],
    points: 1,
  },
  {
    id: 30,
    grade: 7,
    subject: "English Home Language",
    topic: "Grammar",
    term: "Verb",
    forbiddenWords: ["Action", "Doing", "Word", "Run", "Sentence"],
    points: 1,
  },
  {
    id: 31,
    grade: 7,
    subject: "English Home Language",
    topic: "Vocabulary",
    term: "Synonym",
    forbiddenWords: ["Same", "Meaning", "Word", "Similar", "Opposite"],
    points: 1,
  },
  {
    id: 32,
    grade: 7,
    subject: "English Home Language",
    topic: "Comprehension",
    term: "Summary",
    forbiddenWords: ["Short", "Main points", "Story", "Shorten", "Brief"],
    points: 1,
  },
  {
    id: 33,
    grade: 8,
    subject: "English Home Language",
    topic: "Vocabulary",
    term: "Metaphor",
    forbiddenWords: ["Comparison", "Like", "As", "Figure of speech", "Simile"],
    points: 1,
  },
  {
    id: 34,
    grade: 8,
    subject: "English Home Language",
    topic: "Grammar",
    term: "Passive Voice",
    forbiddenWords: ["Subject", "Object", "Action", "Active", "Was"],
    points: 1,
  },
  {
    id: 35,
    grade: 8,
    subject: "English Home Language",
    topic: "Vocabulary",
    term: "Idiom",
    forbiddenWords: ["Saying", "Expression", "Meaning", "Literal", "Phrase"],
    points: 1,
  },
  {
    id: 36,
    grade: 8,
    subject: "English Home Language",
    topic: "Comprehension",
    term: "Narrator",
    forbiddenWords: ["Story", "Tell", "Voice", "Character", "Book"],
    points: 1,
  },
];

export function filterCards(grade, subject, topic) {
  let list = CARDS.filter(function (c) {
    if (c.grade !== grade) return false;
    if (subject && c.subject !== subject) return false;
    if (topic && topic !== "All Topics" && c.topic !== topic) return false;
    return true;
  });

  // Fall back to a wider set so a turn never runs out of cards.
  if (list.length < 6) {
    list = CARDS.filter(function (c) {
      return c.grade === grade && (!subject || c.subject === subject);
    });
  }
  if (list.length < 6) {
    list = CARDS.filter(function (c) {
      return c.grade === grade;
    });
  }
  if (list.length === 0) list = CARDS.slice();
  return list;
}
