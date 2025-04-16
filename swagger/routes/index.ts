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

export const lectureswagger = yaml.load(
  readFileSync(join(__dirname, "./lectures.yaml"), "utf8")
) as object;


export const generateaiswagger = yaml.load(
  readFileSync(join(__dirname, "./generateai.yaml"), "utf8")
) as object;


export const authswagger = yaml.load(
  readFileSync(join(__dirname, "./auth.yaml"), "utf8")
) as object;

export const logsswagger = yaml.load(
  readFileSync(join(__dirname, "./logs.yaml"), "utf8")
) as object;
