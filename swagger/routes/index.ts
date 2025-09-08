import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

export const wordsSwagger = yaml.load(
  readFileSync(join(__dirname, "./words.yaml"), "utf8")
) as object;

export const expressionsSwagger = yaml.load(
  readFileSync(join(__dirname, "./expressions.yaml"), "utf8")
) as object;

export const lectureswagger = yaml.load(
  readFileSync(join(__dirname, "./lectures.yaml"), "utf8")
) as object;

export const labsSwagger = yaml.load(
  readFileSync(join(__dirname, "./labs.yaml"), "utf8")
) as object;

export const usersSwagger = yaml.load(
  readFileSync(join(__dirname, "./users.yaml"), "utf8")
) as object; 