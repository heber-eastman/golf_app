import { Request, Response, NextFunction } from 'express';
import { IUser } from '@golf-app/common';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user as IUser;
  
  if (!user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  
  next();
}; 