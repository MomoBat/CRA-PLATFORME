import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { auditLogger } from '../utils/auditLogger';

const prisma = new PrismaClient();

class AuthService {
  async login(email, password, ipAddress, userAgent) {
    try {
      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          supervisedUsers: true,
          supervisor: true
        }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (!user.isActive) {
        throw new Error('Compte désactivé');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
      }

      // Générer le token JWT
      const token = sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Logger l'audit
      await auditLogger.log({
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        ipAddress,
        userAgent
      });

      // Retourner les données utilisateur (sans mot de passe)
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        token,
        user: userWithoutPassword
      };

    } catch (error) {
      throw error;
    }
  }

  async register(userData, creatorId) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await hash(userData.password, 12);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      // Logger l'audit
      await auditLogger.log({
        action: 'CREATE',
        entityType: 'USER',
        entityId: user.id,
        userId: creatorId,
        newValues: { email: user.email, role: user.role }
      });

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Hasher le nouveau mot de passe
      const hashedNewPassword = await hash(newPassword, 12);

      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      // Logger l'audit
      await auditLogger.log({
        action: 'UPDATE',
        entityType: 'USER',
        entityId: userId,
        userId: userId,
        newValues: { passwordChanged: true }
      });

      return { message: 'Mot de passe modifié avec succès' };

    } catch (error) {
      throw error;
    }
  }

  verifyToken(token) {
    try {
      return verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }
}

export default new AuthService();