export const parseErrorLog = (logData: string) => {
  if (!logData || logData.trim() === '') {
    return [];
  }

  const logEntries = logData
    .split("-----------------------------------")
    .map((entry) => entry.trim())
    .filter((entry) => entry);

  return logEntries.map((entry) => {
    const timestampMatch = entry.match(
      /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ERROR:/
    );
    const stackMatch = entry.match(/ERROR:\n([\s\S]*)/);
    const messageMatch = entry.match(/ERROR:\n([^\n]+)/);

    const timestamp = timestampMatch ? timestampMatch[1] : "Unknown";
    const stack = stackMatch ? stackMatch[1].trim() : "No stack available";
    const message = messageMatch ? messageMatch[1].trim() : "No message available";

    // Extract error type from stack trace
    const errorTypeMatch = stack.match(/^([A-Za-z]+Error):/);
    const errorType = errorTypeMatch ? errorTypeMatch[1] : "UnknownError";

    // Extract file and line information
    const fileLineMatch = stack.match(/at\s+.*?\(([^)]+):(\d+):(\d+)\)/);
    const file = fileLineMatch ? fileLineMatch[1] : null;
    const line = fileLineMatch ? parseInt(fileLineMatch[2]) : null;
    const column = fileLineMatch ? parseInt(fileLineMatch[3]) : null;

    // Extract function name
    const functionMatch = stack.match(/at\s+([^(]+)\(/);
    const functionName = functionMatch ? functionMatch[1].trim() : null;

    return {
      timestamp,
      level: "ERROR",
      message,
      errorType,
      stack,
      file,
      line,
      column,
      functionName,
      date: new Date(timestamp),
      hour: new Date(timestamp).getHours(),
      dayOfWeek: new Date(timestamp).getDay(),
      severity: getErrorSeverity(errorType, message),
    };
  });
};

function getErrorSeverity(errorType: string, message: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalErrors = ['SyntaxError', 'ReferenceError', 'TypeError', 'RangeError'];
  const highErrors = ['ValidationError', 'DatabaseError', 'ConnectionError'];
  const mediumErrors = ['NotFoundError', 'UnauthorizedError', 'ForbiddenError'];
  
  if (criticalErrors.includes(errorType)) return 'critical';
  if (highErrors.includes(errorType)) return 'high';
  if (mediumErrors.includes(errorType)) return 'medium';
  
  // Check message content for severity indicators
  const messageLower = message.toLowerCase();
  if (messageLower.includes('critical') || messageLower.includes('fatal')) return 'critical';
  if (messageLower.includes('error') || messageLower.includes('failed')) return 'high';
  if (messageLower.includes('warning') || messageLower.includes('invalid')) return 'medium';
  
  return 'low';
}
