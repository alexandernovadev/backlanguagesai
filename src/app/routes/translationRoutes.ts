import { Router } from 'express';
import {
  getConfigs,
  generateText,
  processTranslation,
  createChat,
  getChat,
  getChats,
  deleteChat
} from '../controllers/translationController';

const router = Router();

// Get preloaded configurations
router.get('/configs', getConfigs);

// Generate training text
router.post('/generate-text', generateText);

// Process user translation
router.post('/translate', processTranslation);

// Chat management
router.get('/chats', getChats);
router.post('/chat', createChat);
router.get('/chat/:chatId', getChat);
router.delete('/chat/:chatId', deleteChat);

export default router;
