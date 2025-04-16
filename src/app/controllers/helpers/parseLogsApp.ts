export const parseAppLogs = (logData) => {
  const logEntries = logData
    .split("-----------------------------------")
    .map((entry) => entry.trim())
    .filter((entry) => entry);

  return logEntries
    .map((entry) => {
      const timestampMatch = entry.match(
        /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) INFO:/
      );
      const methodMatch = entry.match(/👉 Method: (\w+)/);
      const urlMatch = entry.match(/🌐 URL: (\S+)/);
      const clientIPMatch = entry.match(/💻 Client IP: (\S+)/);
      const userAgentMatch = entry.match(/📱 User-Agent: ([\s\S]+?)\n/);
      const responseTimeMatch = entry.match(/⏳ Response Time: ([\d.]+ ms)/);
      const statusMatch = entry.match(/✅ Status: (\d+)/);

      if (
        timestampMatch &&
        methodMatch &&
        urlMatch &&
        clientIPMatch &&
        userAgentMatch &&
        responseTimeMatch &&
        statusMatch
      ) {
        return {
          timestamp: timestampMatch[1],
          level: "INFO",
          method: methodMatch[1],
          url: urlMatch[1],
          clientIP: clientIPMatch[1],
          userAgent: userAgentMatch[1].trim(),
          status: parseInt(statusMatch[1]),
          responseTime: responseTimeMatch[1],
        };
      }

      return { raw: entry };
    })
    .reverse(); // Last logs first
};
