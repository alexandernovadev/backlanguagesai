export const promptAddEasyWords = (wordsArray: string[]) => {
  return `- Its' IMPORTANT that add these words | ${wordsArray.join(
    ", "
  )} |  to the lecture 
  because the user needs to remember those ones.
  You can skip the words if there are not important to the topic lecture.`.trim();
};
