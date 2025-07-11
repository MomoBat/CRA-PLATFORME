// =============================================
// src/config/email.js
// Configuration pour l'envoi d'emails
// =============================================

import { createTransporter } from 'nodemailer';

class EmailConfig {
  constructor() {
    this.transporter = null;
    this.isConfigured = this.checkConfiguration();
    this.initializeTransporter();
  }

  checkConfiguration() {
    return !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    );
  }

  initializeTransporter() {
    if (!this.isConfigured) {
      console.warn('⚠️  Configuration email manquante. Les emails ne seront pas envoyés.');
      return;
    }

    try {
      this.transporter = createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true', // true pour 465, false pour autres ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ Configuration email initialisée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'email:', error);
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      throw new Error('Transporter email non initialisé');
    }

    try {
      await this.transporter.verify();
      console.log('✅ Connexion email vérifiée');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion email:', error);
      return false;
    }
  }

  getTransporter() {
    return this.transporter;
  }

  getDefaultFromAddress() {
    return process.env.EMAIL_FROM || process.env.EMAIL_USER;
  }

  // Templates d'email
  getEmailTemplates() {
    return {
      welcome: {
        subject: 'Bienvenue sur la plateforme CRA Saint-Louis',
        template: 'welcome'
      },
      passwordReset: {
        subject: 'Réinitialisation de votre mot de passe',
        template: 'password-reset'
      },
      taskAssigned: {
        subject: 'Nouvelle tâche assignée',
        template: 'task-assigned'
      },
      projectInvitation: {
        subject: 'Invitation à rejoindre un projet',
        template: 'project-invitation'
      },
      seminarReminder: {
        subject: 'Rappel: Séminaire à venir',
        template: 'seminar-reminder'
      }
    };
  }
}

export default new EmailConfig();