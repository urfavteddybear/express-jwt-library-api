const logger = require('../config/logger');

class PerformanceMonitor {
  static startTimer(operation) {
    return {
      operation,
      startTime: Date.now(),
      end: function(additionalData = {}) {
        const duration = Date.now() - this.startTime;
        logger.info('Performance metric', {
          operation: this.operation,
          duration: `${duration}ms`,
          ...additionalData
        });
        return duration;
      }
    };
  }

  static logDatabaseQuery(query, params, duration) {
    logger.debug('Database query executed', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      params,
      duration: `${duration}ms`
    });
  }

  static logMemoryUsage() {
    const usage = process.memoryUsage();
    logger.info('Memory usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(usage.external / 1024 / 1024 * 100) / 100} MB`
    });
  }
}

module.exports = PerformanceMonitor;
