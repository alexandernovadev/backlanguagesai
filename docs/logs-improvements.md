# 🚀 Mejoras del Sistema de Logs

## 📋 Resumen de Mejoras

El sistema de logs ha sido completamente mejorado para proporcionar una experiencia mucho mejor en la UI del frontend, incluyendo filtros avanzados, paginación, estadísticas y exportación.

## 🔧 Nuevas Funcionalidades

### 1. **Filtros Avanzados**
- **Por nivel**: INFO, ERROR, UNKNOWN
- **Por método HTTP**: GET, POST, PUT, DELETE, PATCH
- **Por código de estado**: 200, 404, 500, etc.
- **Por rango de fechas**: dateFrom y dateTo
- **Búsqueda de texto**: Busca en URL, IP, User-Agent, stack traces

### 2. **Paginación**
- Control de página actual
- Límite de registros por página (máximo 100)
- Información de total de registros y páginas

### 3. **Estadísticas Detalladas**
- Total de logs por tipo (app/error)
- Distribución por nivel, método y estado
- Logs por rangos de tiempo (24h, 7d, 30d)
- Tiempo de respuesta promedio
- Top 10 endpoints más usados
- Top 10 fuentes de errores

### 4. **Exportación**
- Formato JSON (por defecto)
- Formato CSV
- Descarga automática con nombre de archivo

### 5. **Parsing Mejorado**
- Extracción de más información de los logs
- Clasificación automática de errores por severidad
- Información de archivo y línea para errores
- Datos estructurados para mejor análisis

## 📡 Endpoints Disponibles

### `GET /api/logs`
**Obtener logs con filtros y paginación**

**Parámetros de consulta:**
- `level` - Filtrar por nivel (INFO, ERROR, UNKNOWN)
- `method` - Filtrar por método HTTP
- `status` - Filtrar por código de estado
- `dateFrom` - Fecha desde (YYYY-MM-DD)
- `dateTo` - Fecha hasta (YYYY-MM-DD)
- `search` - Búsqueda de texto
- `page` - Número de página (default: 1)
- `limit` - Registros por página (default: 50, max: 100)

**Ejemplo de respuesta:**
```json
{
  "message": "Logs retrieved successfully",
  "data": {
    "logs": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "totalPages": 25
    },
    "statistics": {
      "total": 1250,
      "byType": { "app": 1000, "error": 250 },
      "byLevel": { "INFO": 1000, "ERROR": 250 },
      "averageResponseTime": 245.67,
      "topEndpoints": [...],
      "topErrorSources": [...]
    },
    "filters": {
      "availableLevels": ["INFO", "ERROR"],
      "availableMethods": ["GET", "POST", "PUT"],
      "availableStatuses": ["200", "404", "500"]
    }
  }
}
```

### `GET /api/logs/statistics`
**Obtener estadísticas detalladas**

**Respuesta:**
```json
{
  "message": "Log statistics retrieved successfully",
  "data": {
    "total": 1250,
    "byType": { "app": 1000, "error": 250 },
    "byLevel": { "INFO": 1000, "ERROR": 250 },
    "byMethod": { "GET": 800, "POST": 300, "PUT": 150 },
    "byStatus": { "200": 1000, "404": 150, "500": 100 },
    "byTimeRange": {
      "last24h": 50,
      "last7d": 300,
      "last30d": 1250
    },
    "averageResponseTime": 245.67,
    "topEndpoints": [
      { "url": "/api/words", "count": 150 },
      { "url": "/api/lectures", "count": 120 }
    ],
    "topErrorSources": [
      { "source": "ValidationError", "count": 50 },
      { "source": "DatabaseError", "count": 30 }
    ]
  }
}
```

### `GET /api/logs/export`
**Exportar logs**

**Parámetros:**
- `format` - Formato de exportación (json, csv)

**Descarga automática del archivo**

### `GET /api/logs/clear`
**Limpiar todos los logs**

## 🎨 Uso en Frontend

### Ejemplo de Componente React

```tsx
import React, { useState, useEffect } from 'react';

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

const LogsDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState<LogFilters>({
    page: 1,
    limit: 50
  });
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (filters: LogFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLogs(data.data.logs);
      setStatistics(data.data.statistics);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (format: 'json' | 'csv') => {
    const response = await fetch(`/api/logs/export?format=${format}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  };

  useEffect(() => {
    fetchLogs(filters);
  }, [filters]);

  return (
    <div className="logs-dashboard">
      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.level || ''} 
          onChange={(e) => setFilters({...filters, level: e.target.value, page: 1})}
        >
          <option value="">Todos los niveles</option>
          <option value="INFO">INFO</option>
          <option value="ERROR">ERROR</option>
        </select>
        
        <input
          type="text"
          placeholder="Buscar..."
          value={filters.search || ''}
          onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
        />
        
        <button onClick={() => exportLogs('json')}>Exportar JSON</button>
        <button onClick={() => exportLogs('csv')}>Exportar CSV</button>
      </div>

      {/* Estadísticas */}
      {statistics && (
        <div className="statistics">
          <div className="stat-card">
            <h3>Total Logs</h3>
            <p>{statistics.total}</p>
          </div>
          <div className="stat-card">
            <h3>Errores</h3>
            <p>{statistics.byType.error}</p>
          </div>
          <div className="stat-card">
            <h3>Tiempo Promedio</h3>
            <p>{statistics.averageResponseTime.toFixed(2)}ms</p>
          </div>
        </div>
      )}

      {/* Tabla de Logs */}
      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Method</th>
              <th>URL</th>
              <th>Status</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className={log.isError ? 'error-row' : ''}>
                <td>{log.timestamp}</td>
                <td>
                  <span className={`badge ${log.level.toLowerCase()}`}>
                    {log.level}
                  </span>
                </td>
                <td>{log.method}</td>
                <td>{log.url}</td>
                <td>
                  <span className={`status ${log.status >= 400 ? 'error' : 'success'}`}>
                    {log.status}
                  </span>
                </td>
                <td>{log.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button 
          disabled={filters.page === 1}
          onClick={() => setFilters({...filters, page: filters.page! - 1})}
        >
          Anterior
        </button>
        <span>Página {filters.page} de {Math.ceil(statistics?.total / filters.limit!)}</span>
        <button 
          onClick={() => setFilters({...filters, page: filters.page! + 1})}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default LogsDashboard;
```

## 🧪 Testing

Usar el script de prueba:

```bash
# Editar el token en el script
nano scripts/test-logs-api.sh

# Ejecutar las pruebas
./scripts/test-logs-api.sh
```

## 🔄 Migración

No se requieren cambios en la base de datos. Los cambios son compatibles hacia atrás:

- El endpoint `/api/logs` mantiene la misma funcionalidad básica
- Los nuevos parámetros son opcionales
- La estructura de respuesta es compatible

## 🎯 Beneficios

1. **Mejor UX**: Filtros y paginación para navegar logs grandes
2. **Análisis**: Estadísticas detalladas para monitoreo
3. **Debugging**: Búsqueda y filtros para encontrar problemas rápidamente
4. **Exportación**: Fácil exportación para análisis externo
5. **Performance**: Paginación para manejar grandes volúmenes de logs
6. **Insights**: Estadísticas automáticas para identificar patrones

## 🚀 Próximas Mejoras

- [ ] Logs en tiempo real con WebSockets
- [ ] Alertas automáticas para errores críticos
- [ ] Dashboard con gráficos interactivos
- [ ] Filtros guardados/favoritos
- [ ] Integración con sistemas de monitoreo externos 