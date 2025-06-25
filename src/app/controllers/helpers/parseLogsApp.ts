export const parseAppLogs = (logData: string) => {
  if (!logData || logData.trim() === '') {
    return [];
  }

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
      const contentLengthMatch = entry.match(/📦 Content-Length: (\d+)/);
      const dataMatch = entry.match(/📝 (?:UserResponser|Data): ([\s\S]+?)(?=\n|$)/);

      if (
        timestampMatch &&
        methodMatch &&
        urlMatch &&
        clientIPMatch &&
        userAgentMatch &&
        responseTimeMatch &&
        statusMatch
      ) {
        const timestamp = timestampMatch[1];
        const method = methodMatch[1];
        const url = urlMatch[1];
        const clientIP = clientIPMatch[1];
        const userAgent = userAgentMatch[1].trim();
        const status = parseInt(statusMatch[1]);
        const responseTime = responseTimeMatch[1];
        const contentLength = contentLengthMatch ? parseInt(contentLengthMatch[1]) : 0;
        
        // Parse data if available
        let requestData = null;
        if (dataMatch) {
          try {
            requestData = JSON.parse(dataMatch[1]);
          } catch (e) {
            requestData = dataMatch[1];
          }
        }

        // Determine if it's an error based on status code
        const isError = status >= 400;
        const isSuccess = status >= 200 && status < 300;

        // Extract endpoint path
        const urlObj = new URL(url, 'http://localhost');
        const pathname = urlObj.pathname;
        const query = urlObj.search;

        return {
          timestamp,
          level: isError ? "ERROR" : "INFO",
          method,
          url,
          pathname,
          query: query || null,
          clientIP,
          userAgent,
          status,
          responseTime,
          responseTimeMs: parseFloat(responseTime.replace(' ms', '')),
          contentLength,
          requestData,
          isError,
          isSuccess,
          date: new Date(timestamp),
          hour: new Date(timestamp).getHours(),
          dayOfWeek: new Date(timestamp).getDay(),
        };
      }

      // Handle raw entries that don't match the expected format
      return { 
        raw: entry,
        timestamp: new Date().toISOString(),
        level: "UNKNOWN",
        type: "unparsed"
      };
    })
    .reverse(); // Last logs first
};
