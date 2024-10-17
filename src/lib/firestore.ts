import { initFirestore } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import WordSearch from "./wordsearch/WordSearchWrapper";
import _ from "lodash";

export const db = initFirestore({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});
let words =
  "EXAMS,REVISION,COURSEWORK,FACULTY,GRADES,RESEARCH,CLUBS,HIGHLIGHTS,STUDY,DEADLINES,LECTURES,CAMBRIDGE,PHOTOGRAPHY,HOMEWORK,EDUCATION,SHEET,CAMPUS,DORMITORY,CLASSES,EDITORIAL,TEST,UNIVERSITY,CANDIDATES,ESSAY,JESUITS,ALUMNI,TIMETABLE,DESIGN,LUNCH,RESULTS,LAYOUT,QUALIFICATIONS,SYLLABUS,PAPERS,EVENTS,XAVIERS,CREATIVE,PROFESSORS,CONTRIBUTORS,RESOURCES,UPDATES,ANNOUNCEMENTS,INTERVIEWS,FEEDBACK,ASSIGNMENTS,COMMUNITY,THRESHOLD,GRADUATION,COLUMNS,FEATURES,PASTPAPER,SUBJECTS,TRADITION,INVIGILATORS,GRADE,CULTURE,LOYOLA,PANORAMA,MOCK,PRACTICAL,MARKING,ARTICLES,TEXTBOOKS,CERTIFICATES,ASSESSMENT,SEMESTERS,ARCHIVES,VISTAS,SUBMISSIONS,PUBLICATIONS,INTERNSHIPS,CIRCULATION,NOTICES,COMPETITIONS,CREDITS,FESTIVITIES,REPORTS,TUTORING,CURRICULUM,EDITION,WORKSHOP,ATTENDANCE,ENRICHMENT,SCHEDULES,PROJECTS,GUIDELINES,REVIEW,COMMITTEES,INNOVATION,SOURCING,ENGAGEMENT,APPLICATIONS,JOURNALS,LECTURERS,PLANNING,PRACTICES,SCRIPTING,SPRINTS,TUTORIALS,SHOWCASES,PLATFORMS,ORGANISATION,SEMINARS,COLLABORATIONS,NETWORKS,POLICIES,FOUNDATIONS,PATHWAYS,EXPERIMENTS,ANALYSIS,PRESENTATIONS,EVALUATIONS,CONNECTIONS,EXCHANGES,PORTFOLIOS,STUDENTS,STRATEGIES,INTERACTIONS,DISCUSSIONS,LEADERSHIP,COACHING,OUTREACH,ACTIVITIES,VENTURES,COURSES,FRAMEWORKS,FINDINGS,SYLLABI,COMPETENCIES,CLASSMATES,DEVELOPMENTS,ESSAYS,PROGRAMME,INNOVATIONS,HISTORIES,MILESTONES,ORIENTATION,EXPLORATION,REFLECTIONS,EXHIBITIONS,OBSERVATIONS,NETWORKING,CONTRIBUTIONS,ENGAGEMENTS,CONFERENCES,IDEATION,TECHNIQUES,DEMONSTRATIONS,WORKSHOPS,EXPERIENCES,LISTINGS,CURATIONS,CATEGORIES,ARTIFACTS,OUTCOMES,TEAMS,CERTIFICATIONS,CREDENTIALS,FACILITIES,REVISIONS,CRITERIA,RECOGNITION,ACCREDITATIONS,SESSIONS,TRENDS,ACHIEVEMENTS,INSTALLATIONS,DIALOGUES,EVALUATORS,OBJECTIVES,STANDARDS,INITIATIVES,COHORTS,EXHIBITS,ASSESSMENTS,EXPLORATIONS,OPPORTUNITIES,DEBATES,TRADITIONS,ORGANIZATIONS,MODULES,NARRATIVES,CELEBRATIONS,DEVELOPMENT,PERSPECTIVES,CLASSROOMS,CURRICULUMS,RESEARCHES,REFERRALS,PARTNERSHIPS,FEEDBACKS,ACCOMPLISHMENTS,ARTISTRY,ASSESSORS,ASSEMBLIES,AUTHENTICITY,BALANCE,BIBLIOGRAPHY,BRAINSTORMING,BREAKOUT,CAREER,DIVERSITY,DOCUMENTATION,EDUCATIONAL,EQUIPMENT,ETHICS,EVALUATION,EXPANSION,FACILITATION,FUNDAMENTALS,GOALS,GROWTH,GROUPWORK,IMPACT,IMPLEMENTATION,INCLUSIVITY,INQUIRY,INSIGHTS,INTEGRATION,INTERACTION,LEARNING,LIBRARY,LITERACY,MASTERY,MENTORSHIP,PARTICIPATION,SCHEDULING,SKILLS,SUMMATIVE,SYNTHESIS,TEACHING,TESTING,THEORIES,TRACKING,TRAINING,TRANSITIONS,YEARBOOKS,ADVOCACY,ACCESSIBILITY,ASSOCIATIONS"
    .toUpperCase()
    .split(",");

export const getWordPool = async () => {
  return words;
};

export const getRemainingAttempts = async (email: string): Promise<number> => {
  let attempts = await db.collection("users").where("email", "==", email).get();
  let attemptData = attempts.docs.map((doc) => doc.data());
  // ifNaN return 0

  if (isNaN(attemptData[0]["attempts"])) {
    return 3;
  }
  return attemptData[0]["attempts"];
};

export const createAttempt = async (email: string) => {
  // make sure user has more than 0 attempts
  let attempts = await getRemainingAttempts(email);
  if (attempts <= 0) {
    throw new Error("No attempts remaining");
  }
  let doc = await db.collection("users").where("email", "==", email).get();
  let userDoc = doc.docs[0];
  if (!userDoc) {
    throw new Error("User not found");
  }
  let wordPool = await getWordPool();
  // get random 10 words
  let words: string[] = [];
  const uniqueWords = new Set<string>();
  while (uniqueWords.size < 10) {
    let index = Math.floor(Math.random() * wordPool.length);
    uniqueWords.add(wordPool[index]);
  }
  words = Array.from(uniqueWords);

  console.log(words);
  let generatedGrid = generateGameGrid(words);
  let xorKey = generateXorEncryptionKey();

  // update the user document with a new field, words and decrement attempts
  await userDoc.ref.update({
    words: generatedGrid.words,
    solutions: generatedGrid.solutions,
    beginTime: Date.now(),
    attempts: attempts - 1,
    xorKey: xorKey,
  });

  return {
    ...generatedGrid,
    key: xorKey, // I know any tech savy person can pry open this key, but it's just at-least simple encryption
  };
};

// generate a 15x15 grid with the words placed randomly (either horizontally, vertically, or diagonally)
// make sure the ALL words are placed in the grid NO MATTER WHAT (even if it means overlapping OR increasing the grid size)
// fill the remaining cells with random letters
export const generateGameGrid = (words: string[]) => {
  let wordSearch = new WordSearch({
    cols: 15,
    rows: 15,
    dictionary: words,
    maxWords: 10,
    upperCase: true,
  });

  let wordSearchBuilt = wordSearch.buildGame();
  // print the grid and words
  return {
    grid: wordSearchBuilt.grid,
    words: wordSearchBuilt.words.map((word) => word.word),
    solutions: wordSearchBuilt.solutions,
  };
};

export const findPosition = async (time: number) => {
  let users = await db.collection("users").orderBy("time", "asc").get();
  let userDocs = users.docs.map((doc) => doc.data());
  let position = 1;
  for (let user of userDocs) {
    if (user["time"] < time) {
      position++;
    } else {
      break;
    }
  }
  return position;
};

export const saveAttempt = async (
  email: string,
  solutions: { [key: string]: string[] }
): Promise<{
  currentPos: number;
  bestPos: number;
}> => {
  // get the user document, and update the time field if the time is less than the current time
  let doc = await db.collection("users").where("email", "==", email).get();
  // calculate the position of the user in the leaderboard
  let userDoc = doc.docs[0];
  if (!userDoc) {
    throw new Error("User not found");
  }
  let userData = userDoc.data();
  let time = Date.now() - userData.beginTime;
  let curPosition = await findPosition(time);
  let bestPosition = userData["time"]
    ? await findPosition(userData["time"])
    : 0;
  if (curPosition < bestPosition) {
    bestPosition = curPosition;
  }
  // check if all words are found
  let foundWords = Object.keys(solutions);
  let allWordsFound = (userData.words as string[]).every((word) =>
    foundWords.includes(word)
  );
  let allSolutionsMatch = Object.keys(userData.solutions).every((word) =>
    _.isEqual(userData.solutions[word], solutions[word])
  );

  if (!allWordsFound || !allSolutionsMatch) {
    return {
      currentPos: curPosition,
      bestPos: bestPosition,
    };
  }
  if (userData["time"] && time > userData["time"]) {
    return {
      currentPos: curPosition,
      bestPos: bestPosition,
    };
  }
  await userDoc.ref.update({
    time,
  });
  return {
    currentPos: curPosition,
    bestPos: bestPosition,
  };
};

// get the leaderboard of the top 5 players with the fastest time and their names and avatars
export const getLeaderboard = async () => {
  let users = await db
    .collection("users")
    .orderBy("time", "asc")
    .limit(10)
    .get();
  let leaderboard = users.docs.map((doc) => doc.data()) as {
    name: string;
    time: number;
    image: string;
  }[];
  // make sure leaderboard has 10 players else fill with empty data
  if (leaderboard.length < 10) {
    let emptyData = Array(10 - leaderboard.length).fill({
      name: "No one",
      time: 0,
      image:
        "https://icons.veryicon.com/png/o/system/ali-mom-icon-library/random-user.png",
    });
    leaderboard = leaderboard.concat(emptyData);
  }
  return leaderboard;
};

function generateXorEncryptionKey() {
  // generates a random 16 byte key
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
}

// encrypt function and decrypt function
export const encrypt = (data: string, key: number[]) => {
  let encrypted = [];
  for (let i = 0; i < data.length; i++) {
    encrypted.push(data.charCodeAt(i) ^ key[i % key.length]);
  }
  return encrypted;
};

export const decrypt = (data: number[], key: number[]) => {
  let decrypted = "";
  for (let i = 0; i < data.length; i++) {
    decrypted += String.fromCharCode(data[i] ^ key[i % key.length]);
  }
  return decrypted;
};
