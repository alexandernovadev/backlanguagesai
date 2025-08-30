import { Router } from 'express';
import {
  getConfigs,
  generateText,
  processTranslation,
  createChat,
  getChat,
  getChats,
  deleteChat,
  updateChatConfig
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
router.put('/chat/:chatId/config', updateChatConfig); // New endpoint for updating chat config

export default router;
