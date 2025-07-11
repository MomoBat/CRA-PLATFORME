// =============================================
// src/config/logger.js
// Configuration pour les logs avec Winston
// =============================================

import { format as _format, createLogger as _createLogger, transports as _transports } from 'winston';
import { join } from 'path';

class LoggerConfig {
  constructor() {
    this.logDir = process.env.LOG_DIR || './logs';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logger = this.createLogger();
  }

  createLogger() {
    // Créer le dossier logs s'il n'existe pas
    const fs = require('fs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const logFormat = _format.combine(
      _format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      _format.errors({ stack: true }),
      _format.json()
    );

    const consoleFormat = _format.combine(
      _format.colorize(),
      _format.simple(),
      _format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    );

    return _createLogger({
      level: this.logLevel,
      format: logFormat,
      transports: [
        // Fichier pour tous les logs
        new _transports.File({
          filename: join(this.logDir, 'app.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Fichier séparé pour les erreurs
        new _transports.File({
          filename: join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Console pour le développement
        ...(process.env.NODE_ENV !== 'production' ? [
          new _transports.Console({
            format: consoleFormat
          })
        ] : [])
      ],
      exceptionHandlers: [
        new _transports.File({
          filename: join(this.logDir, 'exceptions.log')
        })
      ],
      rejectionHandlers: [
        new _transports.File({
          filename: join(this.logDir, 'rejections.log')
        })
      ]
    });
  }

  getLogger() {
    return this.logger;
  }

  // Méthodes helper pour différents types de logs
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

export default new LoggerConfig();