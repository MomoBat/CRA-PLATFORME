// =============================================
// src/config/jwt.js
// Configuration JWT et gestion des tokens
// =============================================

import { sign, verify, decode } from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'crypto';

class JWTConfig {
  constructor() {
    this.secret = process.env.JWT_SECRET || this.generateSecret();
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    this.issuer = process.env.JWT_ISSUER || 'CRA-Saint-Louis';
    this.audience = process.env.JWT_AUDIENCE || 'cra-users';
  }

  generateSecret() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be defined in production');
    }
    return randomBytes(64).toString('hex');
  }

  generateToken(payload, options = {}) {
    try {
      const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: randomUUID(), // Unique token ID
      };

      const tokenOptions = {
        expiresIn: options.expiresIn || this.expiresIn,
        issuer: this.issuer,
        audience: this.audience,
        ...options
      };

      return sign(tokenPayload, this.secret, tokenOptions);
    } catch (error) {
      throw new Error(`Erreur lors de la génération du token: ${error.message}`);
    }
  }

  generateRefreshToken(userId) {
    return this.generateToken(
      { userId, type: 'refresh' },
      { expiresIn: this.refreshExpiresIn }
    );
  }

  verifyToken(token) {
    try {
      return verify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expiré');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token invalide');
      } else {
        throw new Error(`Erreur de vérification du token: ${error.message}`);
      }
    }
  }

  decodeToken(token) {
    try {
      return decode(token, { complete: true });
    } catch (error) {
      throw new Error(`Erreur lors du décodage du token: ${error.message}`);
    }
  }

  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return new Date(decoded.payload.exp * 1000);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'expiration: ${error.message}`);
    }
  }

  isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      return Date.now() >= expiration.getTime();
    } catch (error) {
      return true;
    }
  }
}

export default new JWTConfig();