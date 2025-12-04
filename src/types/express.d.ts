// src/types/express.d.ts
import { User } from './index';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
    
    interface Request {
      user?: User;
    }
  }
}

export {};