import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { parseAppLogs } from "./helpers/parseLogsApp";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { parseErrorLog } from "./helpers/parseLogErrors";

interface LogFilters {
  level?: string;
  method?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getLogs = (req: Request, res: Response) => {
  try {
    const logsPath = path.join(__dirname, "../../../logs");
    const errorLog = fs.readFileSync(
      path.join(logsPath, "errors.log"),
      "utf-8"
    );
    const appLog = fs.readFileSync(path.join(logsPath, "app.log"), "utf-8");

    // Parse logs
    const formattedAppLog = parseAppLogs(appLog);
    const formattedErrorLog = parseErrorLog(errorLog);

    // Get filters from query params
    const filters: LogFilters = {
      level: req.query.level as string,
      method: req.query.method as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    // Combine and filter logs
    const allLogs = [
      ...formattedAppLog.map(log => ({ ...log, type: 'app' })),
      ...formattedErrorLog.map(log => ({ ...log, type: 'error' }))
    ];

    const filteredLogs = filterLogs(allLogs, filters);
    const paginatedLogs = paginateLogs(filteredLogs, filters.page!, filters.limit!);

    // Get statistics
    const statistics = calculateLogStatistics(allLogs);

    return successResponse(res, "Logs retrieved successfully", {
      logs: paginatedLogs.logs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / filters.limit!),
      },
      statistics,
      filters: {
        availableLevels: [...new Set(allLogs.map(log => log.level).filter(Boolean))],
        availableMethods: [...new Set(allLogs.map(log => (log as any).method).filter(Boolean))],
        availableStatuses: [...new Set(allLogs.map(log => (log as any).status?.toString()).filter(Boolean))],
      }
    });
  } catch (error) {
    return errorResponse(res, "Failed to retrieve log", 500, error);
  }
};

export const getLogStatistics = (req: Request, res: Response) => {
  try {
    const logsPath = path.join(__dirname, "../../../logs");
    const errorLog = fs.readFileSync(
      path.join(logsPath, "errors.log"),
      "utf-8"
    );
    const appLog = fs.readFileSync(path.join(logsPath, "app.log"), "utf-8");

    const formattedAppLog = parseAppLogs(appLog);
    const formattedErrorLog = parseErrorLog(errorLog);

    const allLogs = [
      ...formattedAppLog.map(log => ({ ...log, type: 'app' })),
      ...formattedErrorLog.map(log => ({ ...log, type: 'error' }))
    ];

    const statistics = calculateLogStatistics(allLogs);

    return successResponse(res, "Log statistics retrieved successfully", statistics);
  } catch (error) {
    return errorResponse(res, "Failed to retrieve log statistics", 500, error);
  }
};

export const exportLogs = (req: Request, res: Response) => {
  try {
    const logsPath = path.join(__dirname, "../../../logs");
    const errorLog = fs.readFileSync(
      path.join(logsPath, "errors.log"),
      "utf-8"
    );
    const appLog = fs.readFileSync(path.join(logsPath, "app.log"), "utf-8");

    const formattedAppLog = parseAppLogs(appLog);
    const formattedErrorLog = parseErrorLog(errorLog);

    const allLogs = [
      ...formattedAppLog.map(log => ({ ...log, type: 'app' })),
      ...formattedErrorLog.map(log => ({ ...log, type: 'error' }))
    ];

    const format = req.query.format as string || 'json';
    const filename = `logs-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csvContent = convertToCSV(allLogs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvContent);
    }

    // Default JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.json(allLogs);
  } catch (error) {
    return errorResponse(res, "Failed to export logs", 500, error);
  }
};

export const clearLogs = (req: Request, res: Response) => {
  try {
    const logsPath = path.join(__dirname, "../../../logs");
    const logFiles = [
      "app.log",
      "errors.log",
      "exceptions.log",
      "rejections.log",
    ];

    logFiles.forEach((file) => {
      const filePath = path.join(logsPath, file);
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, ""); // Clean all logs
      }
    });

    return successResponse(res, "All logs have been cleared successfully", {});
  } catch (error) {
    return errorResponse(res, "Failed to clear logs ", 500, error);
  }
};

// Helper functions
function filterLogs(logs: any[], filters: LogFilters) {
  return logs.filter(log => {
    // Filter by level
    if (filters.level && log.level !== filters.level) return false;
    
    // Filter by method
    if (filters.method && log.method !== filters.method) return false;
    
    // Filter by status
    if (filters.status && log.status?.toString() !== filters.status) return false;
    
    // Filter by date range
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (logDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(filters.dateTo);
      if (logDate > toDate) return false;
    }
    
    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = [
        log.url,
        log.clientIP,
        log.userAgent,
        log.method,
        log.stack,
        log.raw
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchLower)) return false;
    }
    
    return true;
  });
}

function paginateLogs(logs: any[], page: number, limit: number) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    logs: logs.slice(startIndex, endIndex),
    total: logs.length,
    page,
    limit
  };
}

function calculateLogStatistics(logs: any[]) {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: logs.length,
    byType: {
      app: logs.filter(log => log.type === 'app').length,
      error: logs.filter(log => log.type === 'error').length,
    },
    byLevel: {} as Record<string, number>,
    byMethod: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byTimeRange: {
      last24h: logs.filter(log => new Date(log.timestamp) > last24h).length,
      last7d: logs.filter(log => new Date(log.timestamp) > last7d).length,
      last30d: logs.filter(log => new Date(log.timestamp) > last30d).length,
    },
    averageResponseTime: 0,
    topEndpoints: [] as Array<{url: string, count: number}>,
    topErrorSources: [] as Array<{source: string, count: number}>
  };

  // Calculate level statistics
  logs.forEach(log => {
    if (log.level) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    }
    if (log.method) {
      stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
    }
    if (log.status) {
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
    }
  });

  // Calculate average response time
  const responseTimes = logs
    .filter(log => log.responseTime)
    .map(log => parseFloat(log.responseTime.replace(' ms', '')));
  
  if (responseTimes.length > 0) {
    stats.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  // Top endpoints
  const endpointCounts: Record<string, number> = {};
  logs.forEach(log => {
    if (log.url) {
      endpointCounts[log.url] = (endpointCounts[log.url] || 0) + 1;
    }
  });
  stats.topEndpoints = Object.entries(endpointCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([url, count]) => ({ url, count: count as number }));

  // Top error sources
  const errorCounts: Record<string, number> = {};
  logs.filter(log => log.type === 'error').forEach(log => {
    const source = log.stack?.split('\n')[1]?.trim() || 'Unknown';
    errorCounts[source] = (errorCounts[source] || 0) + 1;
  });
  stats.topErrorSources = Object.entries(errorCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([source, count]) => ({ source, count: count as number }));

  return stats;
}

function convertToCSV(logs: any[]) {
  if (logs.length === 0) return '';
  
  const headers = Object.keys(logs[0]);
  const csvRows = [headers.join(',')];
  
  logs.forEach(log => {
    const values = headers.map(header => {
      const value = log[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}
