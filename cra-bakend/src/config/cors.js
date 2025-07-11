// =============================================
// src/config/cors.js
// Configuration CORS pour la sécurité
// =============================================

import cors from 'cors';

class CORSConfig {
  constructor() {
    this.allowedOrigins = this.getAllowedOrigins();
    this.corsOptions = this.getCorsOptions();
  }

  getAllowedOrigins() {
    const origins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    // Origines par défaut pour le développement
    const defaultOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://localhost:5173',
    ];

    // En production, utiliser uniquement les origines configurées
    if (process.env.NODE_ENV === 'production') {
      return origins.length > 0 ? origins : [];
    }

    // En développement, combiner les origines configurées avec les défauts
    return [...new Set([...origins, ...defaultOrigins])];
  }

  getCorsOptions() {
    return {
      origin: (origin, callback) => {
        // Permettre les requêtes sans origine (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);

        // Vérifier si l'origine est autorisée
        if (this.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`🚫 Origine CORS non autorisée: ${origin}`);
          callback(new Error('Non autorisé par la politique CORS'));
        }
      },
      credentials: true, // Permettre les cookies
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Total-Pages',
        'X-Current-Page',
        'X-Per-Page'
      ],
      maxAge: 86400, // 24 heures
      optionsSuccessStatus: 200 // Support des navigateurs legacy
    };
  }

  // Middleware CORS personnalisé
  middleware() {
    return cors(this.corsOptions);
  }

  // Configuration CORS pour les routes spécifiques
  getSpecificCorsOptions(allowedOrigins = []) {
    return {
      ...this.corsOptions,
      origin: allowedOrigins
    };
  }

  // Configuration CORS pour les API publiques
  getPublicCorsOptions() {
    return {
      ...this.corsOptions,
      origin: true // Autoriser toutes les origines
    };
  }

  // Configuration CORS stricte pour les opérations sensibles
  getStrictCorsOptions() {
    return {
      ...this.corsOptions,
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    };
  }
}

export const corsConfig = new CORSConfig();