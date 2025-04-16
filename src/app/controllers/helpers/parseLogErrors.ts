export const parseErrorLog = (logData) => {
  const logEntries = logData
    .split("-----------------------------------")
    .map((entry) => entry.trim())
    .filter((entry) => entry);

  return logEntries.map((entry) => {
    const timestampMatch = entry.match(
      /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ERROR:/
    );
    const stackMatch = entry.match(/ERROR:\n([\s\S]*)/);

    return {
      timestamp: timestampMatch ? timestampMatch[1] : "Unknown",
      stack: stackMatch ? stackMatch[1].trim() : "No stack available",
    };
  });
};
