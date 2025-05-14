import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Do not import routes/middleware/models here!

const port = process.env.PORT || 3000;

export function createApp() {
  const app = express();

  // Swagger setup
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Golf App API',
        version: '1.0.0',
        description: 'API for managing golf tee times',
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: 'Development server',
        },
      ],
    },
    apis: [
      `${__dirname}/routes/*.ts`,
      `${__dirname}/swagger.ts`
    ],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // Import routes and middleware after DB/models are ready
  const passport = require('./config/passport').default;
  const authRoutes = require('./routes/auth').default;
  const uploadRoutes = require('./routes/upload').default;
  const { errorHandler } = require('./middleware/error');
  const { startUploadCheckScheduler } = require('./jobs/adminAlert');
  const { startNotificationWorker } = require('./jobs/notificationWorker');
  const searchRouter = require('./routes/search').default;
  const notificationsRouter = require('./routes/notifications').default;
  const deviceTokensRouter = require('./routes/deviceTokens').default;

  // Routes
  app.use('/auth', passport.initialize(), authRoutes);
  app.use('/admin', uploadRoutes);
  app.use('/', searchRouter);
  app.use('/notifications', notificationsRouter);
  app.use('/device-tokens', deviceTokensRouter);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling
  app.use(errorHandler);

  // Start the schedulers
  startUploadCheckScheduler();
  startNotificationWorker();

  // 404 handler
  app.all('*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}

// For production usage
let app: express.Express | undefined = undefined;
if (require.main === module) {
  app = createApp();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app || createApp(); 