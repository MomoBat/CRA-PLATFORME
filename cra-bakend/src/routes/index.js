import { Router } from 'express';
const router = Router();

// Import des routes
import authRoutes from './auth';
import userRoutes from './users';
import projectRoutes from './projects';
import activityRoutes from './activities';
import taskRoutes from './tasks';
import documentRoutes from './documents';
import formRoutes from './forms';
import seminarRoutes from './seminars';
import commentRoutes from './comments';
import notificationRoutes from './notifications';
import dashboardRoutes from './dashboard';

// Configuration des routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/activities', activityRoutes);
router.use('/tasks', taskRoutes);
router.use('/documents', documentRoutes);
router.use('/forms', formRoutes);
router.use('/seminars', seminarRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

// Route de base
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API CRA Saint-Louis - Plateforme de gestion scientifique',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      activities: '/api/activities',
      tasks: '/api/tasks',
      documents: '/api/documents',
      forms: '/api/forms',
      seminars: '/api/seminars',
      comments: '/api/comments',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard'
    }
  });
});

export default router;