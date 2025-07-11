// =============================================
// src/config/upload.js
// Configuration pour l'upload de fichiers
// =============================================

import multer, { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync, unlinkSync, renameSync } from 'fs';
import { randomUUID } from 'crypto';

class UploadConfig {
  constructor() {
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.allowedMimeTypes = {
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain'
      ],
      images: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
      ],
      archives: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
      ]
    };
    
    this.initializeDirectories();
  }

  initializeDirectories() {
    const directories = [
      this.uploadPath,
      join(this.uploadPath, 'documents'),
      join(this.uploadPath, 'images'),
      join(this.uploadPath, 'temp'),
      join(this.uploadPath, 'archives')
    ];

    directories.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Dossier créé: ${dir}`);
      }
    });
  }

  getStorage(destination = 'temp') {
    return diskStorage({
      destination: (_req, _file, cb) => {
        const uploadDir = join(this.uploadPath, destination);
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = randomUUID();
        const extension = extname(file.originalname);
        const filename = `${uniqueSuffix}${extension}`;
        cb(null, filename);
      }
    });
  }

  fileFilter(_req, file, cb) {
    const allAllowedTypes = [
      ...this.allowedMimeTypes.documents,
      ...this.allowedMimeTypes.images,
      ...this.allowedMimeTypes.archives
    ];

    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
    }
  }

  getMulterConfig(destination = 'temp') {
    return multer({
      storage: this.getStorage(destination),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Maximum 10 fichiers simultanés
      }
    });
  }

  // Configuration spécifique pour les documents
  getDocumentUpload() {
    return this.getMulterConfig('documents');
  }

  // Configuration spécifique pour les images
  getImageUpload() {
    return this.getMulterConfig('images');
  }

  // Configuration pour upload multiple
  getMultipleUpload(destination = 'temp', maxFiles = 5) {
    return this.getMulterConfig(destination).array('files', maxFiles);
  }

  // Configuration pour upload single
  getSingleUpload(destination = 'temp', fieldName = 'file') {
    return this.getMulterConfig(destination).single(fieldName);
  }

  // Utilitaire pour obtenir le type de fichier
  getFileType(mimetype) {
    if (this.allowedMimeTypes.documents.includes(mimetype)) return 'document';
    if (this.allowedMimeTypes.images.includes(mimetype)) return 'image';
    if (this.allowedMimeTypes.archives.includes(mimetype)) return 'archive';
    return 'unknown';
  }

  // Utilitaire pour valider la taille du fichier
  validateFileSize(size) {
    return size <= this.maxFileSize;
  }

  // Utilitaire pour obtenir une URL de fichier
  getFileUrl(filename, type = 'documents') {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  // Utilitaire pour supprimer un fichier
  async deleteFile(filepath) {
    try {
      if (existsSync(filepath)) {
        unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return false;
    }
  }

  // Utilitaire pour déplacer un fichier
  async moveFile(sourcePath, destinationPath) {
    try {
      renameSync(sourcePath, destinationPath);
      return true;
    } catch (error) {
      console.error('Erreur lors du déplacement du fichier:', error);
      return false;
    }
  }
}

export const uploadConfig = new UploadConfig();

