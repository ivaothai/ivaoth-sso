import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class APIKeyMiddleware implements NestMiddleware<Request, Response> {
  use(req: Request, res: Response, next: () => void) {
    if (
      (req.method.toUpperCase() === 'GET' &&
        req.query['apiKey'] === process.env['API_KEY']) ||
      req.body['apiKey'] === process.env['API_KEY']
    ) {
      next();
    } else {
      res.status(401).send('No API Key').end();
    }
  }
}
