import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

export const fixesSwagger = yaml.load(
  readFileSync(join(__dirname, "./fixes.yaml"), "utf8")
) as object;

export const statisticsSwagger = yaml.load(
  readFileSync(join(__dirname, "./statistics.yaml"), "utf8")
) as object;

export const wordsSwagger = yaml.load(
  readFileSync(join(__dirname, "./words.yaml"), "utf8")
) as object;

export const questionsSwagger = yaml.load(
  readFileSync(join(__dirname, "./questions.yaml"), "utf8")
) as object;

export const examsSwagger = yaml.load(
  readFileSync(join(__dirname, "./exams.yaml"), "utf8")
) as object;

export const examAttemptsSwagger = yaml.load(
  readFileSync(join(__dirname, "./examAttempts.yaml"), "utf8")
) as object;

export const lectureswagger = yaml.load(
  readFileSync(join(__dirname, "./lectures.yaml"), "utf8")
) as object;

export const generateaiswagger = yaml.load(
  readFileSync(join(__dirname, "./generateai.yaml"), "utf8")
) as object;

export const authswagger = yaml.load(
  readFileSync(join(__dirname, "./auth.yaml"), "utf8")
) as object;



export const cleanerSwagger = yaml.load(
  readFileSync(join(__dirname, "./cleaner.yaml"), "utf8")
) as object;

export const usersSwagger = yaml.load(
  readFileSync(join(__dirname, "./users.yaml"), "utf8")
) as object; 