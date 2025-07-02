const morgan = require('morgan');
const logger = require('../config/logger');

// Custom Morgan format
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Create Morgan middleware
const httpLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip logging for health check endpoint in production
    if (process.env.NODE_ENV === 'production' && req.url === '/health') {
      return true;
    }
    return false;
  }
});

// Request ID middleware
const requestId = (req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9);
  res.set('X-Request-ID', req.requestId);
  
  // Add request ID to logger context
  const originalLog = logger.log;
  logger.log = function(level, message, meta = {}) {
    return originalLog.call(this, level, message, { ...meta, requestId: req.requestId });
  };
  
  next();
};

// Log request details
const logRequest = (req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
};

// Log response details
const logResponse = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
};

module.exports = {
  httpLogger,
  requestId,
  logRequest,
  logResponse
};
