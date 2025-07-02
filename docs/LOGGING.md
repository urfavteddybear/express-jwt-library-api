# Logging System Documentation

## Overview
The Library API uses Winston for comprehensive logging with file rotation, structured JSON logging, and multiple log levels.

## Log Levels
- **error**: Error conditions
- **warn**: Warning conditions
- **info**: Informational messages
- **http**: HTTP request/response logs
- **verbose**: Verbose information
- **debug**: Debug information
- **silly**: Very detailed debug information

## Log Files

### File Structure
```
logs/
├── combined-YYYY-MM-DD.log    # All logs (info level and above)
├── error-YYYY-MM-DD.log       # Error logs only
└── access-YYYY-MM-DD.log      # HTTP request logs
```

### File Rotation
- **Daily rotation**: New files created daily
- **Size limit**: 20MB per file
- **Retention**: 
  - Combined logs: 14 days
  - Error logs: 30 days
  - Access logs: 7 days

## Log Format

### JSON Format (Files)
```json
{
  "timestamp": "2025-07-02 14:30:45",
  "level": "info",
  "message": "Request completed",
  "requestId": "abc123def",
  "method": "GET",
  "url": "/api/v1/books",
  "statusCode": 200,
  "duration": "45ms"
}
```

### Console Format (Development)
```
14:30:45 [info]: Request completed {"requestId":"abc123def","method":"GET","url":"/api/v1/books","statusCode":200,"duration":"45ms"}
```

## Configuration

### Environment Variables
```bash
LOG_LEVEL=info  # Minimum log level to capture
NODE_ENV=development  # Affects console output format
```

## Usage Examples

### Basic Logging
```javascript
const logger = require('./config/logger');

logger.info('User action completed', { userId: 123, action: 'book_created' });
logger.error('Database connection failed', { error: err.message });
logger.debug('Processing request', { requestData: req.body });
```

### Performance Monitoring
```javascript
const PerformanceMonitor = require('./utils/performanceMonitor');

// Time an operation
const timer = PerformanceMonitor.startTimer('database_query');
// ... perform operation
timer.end({ recordsAffected: 5 });

// Log memory usage
PerformanceMonitor.logMemoryUsage();
```

### Request Context
Each request gets a unique `requestId` that's included in all logs for that request, making it easy to trace request flows.

## HTTP Request Logging
All HTTP requests are automatically logged with:
- Request method and URL
- User agent and IP address
- Response status code and content length
- Request duration
- Request body (for non-GET requests)

## Error Logging
Errors are logged with full context including:
- Error message and stack trace
- Request details (method, URL, IP, user agent)
- Request body
- Timestamp and request ID

## Best Practices

1. **Use appropriate log levels**: Don't log everything as `info`
2. **Include context**: Always include relevant data with your logs
3. **Avoid logging sensitive data**: Never log passwords, tokens, etc.
4. **Use structured logging**: Provide data as objects, not just strings
5. **Monitor log sizes**: Keep an eye on disk usage in production

## Monitoring and Alerts

In production, consider setting up:
- Log aggregation (ELK stack, Splunk, etc.)
- Error alerting based on error rate
- Performance monitoring based on response times
- Disk space monitoring for log files
