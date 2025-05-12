import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/error';
import { startUploadCheckScheduler } from './jobs/adminAlert';
import searchRouter from './routes/search';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', uploadRoutes);
app.use('/', searchRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Start the upload check scheduler
startUploadCheckScheduler();

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not Found' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app; 