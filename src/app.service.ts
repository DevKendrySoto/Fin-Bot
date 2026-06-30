import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInfo() {
    return {
      name: 'FinBot API',
      version: '0.1.0',
      description: 'Telegram Personal Finance Assistant',
      endpoints: {
        health: '/api/health',
        documentation: '/docs',
      },
    };
  }
}
