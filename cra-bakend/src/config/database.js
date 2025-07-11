// =============================================
// src/config/database.js
// Configuration de la base de données Prisma
// =============================================

import { PrismaClient } from '@prisma/client';

class DatabaseConfig {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (!this.prisma) {
        this.prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
          errorFormat: 'pretty',
        });
      }

      // Tester la connexion
      await this.prisma.$connect();
      this.isConnected = true;
      
      console.log('✅ Connexion à la base de données établie');
      
      return this.prisma;
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
        this.isConnected = false;
        console.log('🔌 Déconnexion de la base de données');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  }

  getClient() {
    if (!this.prisma) {
      throw new Error('Base de données non initialisée. Appelez connect() d\'abord.');
    }
    return this.prisma;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Instance singleton
const databaseConfig = new DatabaseConfig();

export default databaseConfig;