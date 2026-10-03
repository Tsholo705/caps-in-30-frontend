// Simple service layer.
// Today everything is mocked with localStorage. Later, each function here will
// call the real ASP.NET Core Web API (see README.md for the endpoint map).


import { filterCards } from "../data/cards.js";

const API_BASE_URL = "http://localhost:5172/api";
const TOKEN_KEY = "caps30_token";

const USERS_KEY = "caps30_users";
const CURRENT_USER_KEY = "caps30_current_user";
const HISTORY_KEY = "caps30_score_history";
const QUIZ_CONFIG_KEY = "caps30_quiz_config";
const QUIZ_RESULT_KEY = "caps30_quiz_result";
const TEAM_GAME_KEY = "caps30_team_game";

// ---------- small storage helpers ----------
function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage errors (for example private browsing mode).
  }
}

function removeKey(key) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

// Pretend we waited for a network call.
function delay(value) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(value);
    }, 250);
  });
}

// ---------- AUTH (future: POST /api/auth/register, /api/auth/login) ----------
export async function registerUser(details) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: details.name,
      username: details.username,
      email: details.email,
      password: details.password,
      grade: Number(details.grade),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed.");
  }

  if (data.token) {
    writeJson(TOKEN_KEY, data.token);
  }

  const user = {
    id: data.userId,
    name: data.name,
    username: data.username,
    email: data.email,
    grade: data.grade,
  };

  writeJson(CURRENT_USER_KEY, user);

  return user;
}

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.message || "Wrong username or password."
    );
  }

  // Save JWT token
  writeJson(TOKEN_KEY, data.token);

  // Create the user object that the frontend expects
  const user = {
    id: data.userId,
    name: data.name,
    username: username,
    email: data.email,
    grade: data.grade,
  };

  writeJson(CURRENT_USER_KEY, user);

  return user;
}

export function logoutUser() {
  removeKey(CURRENT_USER_KEY);
  removeKey(TOKEN_KEY);

  return Promise.resolve(true);
}

export function getCurrentUser() {
  return readJson(CURRENT_USER_KEY, null);
}

// ---------- SOLO QUIZ (future: GET /api/questions) ----------
const API_URL = "http://localhost:5172";

export async function getQuestions(grade, subject, topic, howMany) {
  const params = new URLSearchParams({
    grade: Number(grade),
    subject: subject,
    topic: topic,
    howMany: Number(howMany),
  });

  const response = await fetch(
    `${API_URL}/api/questions?${params.toString()}`
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load quiz questions.");
  }

  return response.json();
}

export function saveQuizConfig(config) {
  writeJson(QUIZ_CONFIG_KEY, config);
}

export function getQuizConfig() {
  return readJson(QUIZ_CONFIG_KEY, null);
}

export function saveQuizResult(result) {
  writeJson(QUIZ_RESULT_KEY, result);
}

export function getQuizResult() {
  return readJson(QUIZ_RESULT_KEY, null);
}

export async function getSubjects() {
  const response = await fetch(`${API_BASE_URL}/subjects`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.message || "Could not load subjects."
    );
  }

  return data;
}

export async function getCategoriesBySubject(subjectId) {
  const response = await fetch(
    `${API_BASE_URL}/categories/by-subject/${subjectId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.message || "Could not load topics."
    );
  }

  return data;
}

// ---------- SCORE HISTORY (future: GET/POST /api/scores) ----------

export async function getScoreHistory() {
  const token = readJson(TOKEN_KEY, null);

  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.message || "Could not load score history."
    );
  }

  return data;
}

export async function addScoreToHistory(entry) {
  const token = readJson(TOKEN_KEY, null);

  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject: entry.subject,
      topic: entry.topic,
      grade: Number(entry.grade),
      correct: entry.correct,
      total: entry.total,
      percentage: entry.percentage,
      timeUsed: entry.timeUsed,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.message || "Could not save score."
    );
  }

  return data;
}

// ---------- TEAM MODE (future: POST /api/team-games) ----------
export function getTeamCards(grade, subject, topic) {
  return shuffle(filterCards(Number(grade), subject, topic));
}

export function saveTeamGame(game) {
  writeJson(TEAM_GAME_KEY, game);
}

export function getTeamGame() {
  return readJson(TEAM_GAME_KEY, null);
}

export function clearTeamGame() {
  removeKey(TEAM_GAME_KEY);
}

// ---------- helper ----------
export function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
