import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress;

  console.log('\n========== INCOMING REQUEST ==========');
  console.log(`[${timestamp}] ${method} ${url}`);
  console.log(`IP: ${ip}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Log body for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }

  // Log query parameters for GET requests
  if (method === 'GET' && Object.keys(req.query).length > 0) {
    console.log('Query params:', JSON.stringify(req.query, null, 2));
  }

  // Log file information if present
  if (req.file) {
    console.log('File uploaded:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  }

  console.log('=====================================\n');

  // Capture response time
  const startTime = Date.now();

  // Override res.json to log the response
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    console.log(
      `[${timestamp}] Response sent for ${method} ${url} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
    if (res.statusCode >= 400) {
      console.log('Response body:', JSON.stringify(body, null, 2));
    }
    return originalJson.call(this, body);
  };

  next();
};
