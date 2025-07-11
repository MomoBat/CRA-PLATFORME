import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { join } from 'path';

// Import des routes
import routes from './routes';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

const app = express();

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',


  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware pour parser le JSON
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Route de santé
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CRA Saint-Louis API'
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Route 404
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

export default app;