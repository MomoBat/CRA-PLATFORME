// =============================================
// src/config/index.js
// Point d'entrée pour toutes les configurations
// =============================================

import database from './database';
import jwt from './jwt';
import upload from './upload';
import cors from './cors';
import email from './email';
import logger from './logger';

export default {
  database,
  jwt,
  upload,
  cors,
  email,
  logger
};
