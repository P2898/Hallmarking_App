import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Chat, Message, Offer, User, Listing } from '../models';
import { Op } from 'sequelize';

const router = Router();

// GET all chats for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
        { model: User, as: 'seller', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'price', 'images'] },
      ],
      order: [['updatedAt', 'DESC']],
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Fetch chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// GET all chats (Admin only)
router.get('/all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const chats = await Chat.findAll({
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
        { model: User, as: 'seller', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'price', 'images'] },
      ],
      order: [['updatedAt', 'DESC']],
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Fetch all chats error:', error);
    res.status(500).json({ error: 'Failed to fetch all chats' });
  }
});

// GET or CREATE a chat
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { sellerId, listingId } = req.body;

    if (!sellerId || !listingId) {
      return res.status(400).json({ error: 'sellerId and listingId are required' });
    }

    if (buyerId === sellerId) {
      return res.status(400).json({ error: 'You cannot start a chat with yourself' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      where: {
        listingId,
        [Op.or]: [
          { buyerId, sellerId },
          { buyerId: sellerId, sellerId: buyerId } // Handle case where roles might be flipped in a different transaction
        ]
      },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
        { model: User, as: 'seller', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'price', 'images'] },
      ],
    });

    if (!chat) {
      chat = await Chat.create({
        buyerId,
        sellerId,
        listingId,
        unreadCount: 0,
      });

      // Refetch with associations
      chat = await Chat.findByPk(chat.id, {
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
          { model: User, as: 'seller', attributes: ['id', 'email', 'displayName', 'photoURL', 'companyName', 'city', 'state'] },
          { model: Listing, as: 'listing', attributes: ['id', 'title', 'price', 'images'] },
        ],
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Get/Create chat error:', error);
    res.status(500).json({ error: 'Failed to initiate chat' });
  }
});

// GET all messages in a chat
router.get('/:chatId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const userId = req.user!.id;

    // Check if user belongs to this chat
    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.buyerId !== userId && chat.sellerId !== userId)) {
      return res.status(403).json({ error: 'Not authorized to view messages in this chat' });
    }

    const messages = await Message.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']],
    });

    // Reset unread count if the user is viewing messages and the last sender was the other person
    if (chat.lastSenderId && chat.lastSenderId !== userId) {
      await chat.update({ unreadCount: 0 });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST a message
router.post('/:chatId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const { text } = req.body;
    const senderId = req.user!.id;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.buyerId !== senderId && chat.sellerId !== senderId)) {
      return res.status(403).json({ error: 'Not authorized to post messages in this chat' });
    }

    const message = await Message.create({
      chatId,
      senderId,
      text,
      read: false,
    });

    // Update last message details in chat
    const currentUnread = chat.lastSenderId === senderId ? chat.unreadCount + 1 : 1;
    await chat.update({
      lastMessage: text,
      lastSenderId: senderId,
      unreadCount: currentUnread,
    });

    // Socket.io emit
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('message', message);
      // Emit chat update to both parties for their inbox
      io.to(`user-${chat.buyerId}`).emit('chatUpdate', chat);
      io.to(`user-${chat.sellerId}`).emit('chatUpdate', chat);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Post message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET all offers in a chat
router.get('/:chatId/offers', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const userId = req.user!.id;

    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.buyerId !== userId && chat.sellerId !== userId)) {
      return res.status(403).json({ error: 'Not authorized to view offers in this chat' });
    }

    const offers = await Offer.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json(offers);
  } catch (error) {
    console.error('Fetch offers error:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST an offer
router.post('/:chatId/offers', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const { amount, message } = req.body;
    const senderId = req.user!.id;

    if (!amount) {
      return res.status(400).json({ error: 'Offer amount is required' });
    }

    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.buyerId !== senderId && chat.sellerId !== senderId)) {
      return res.status(403).json({ error: 'Not authorized to make offers in this chat' });
    }

    const offer = await Offer.create({
      chatId,
      senderId,
      amount,
      message: message || null,
      status: 'pending',
    });

    // Emit Socket.io event for the offer
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('offer', offer);
    }

    res.status(201).json(offer);
  } catch (error) {
    console.error('Post offer error:', error);
    res.status(500).json({ error: 'Failed to make offer' });
  }
});

// PUT offer status (Accept/Decline)
router.put('/:chatId/offers/:offerId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const offerId = req.params.offerId as string;
    const { status } = req.body;
    const userId = req.user!.id;

    if (!status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (accepted or declined) is required' });
    }

    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.buyerId !== userId && chat.sellerId !== userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const offer = await Offer.findOne({ where: { id: offerId, chatId } });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Only recipient can update status (if senderId is buyer, seller updates, etc.)
    if (offer.senderId === userId) {
      return res.status(403).json({ error: 'You cannot update status of your own offer' });
    }

    await offer.update({ status });

    // Emit Socket.io status update
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('offerStatusUpdate', offer);
    }

    res.status(200).json(offer);
  } catch (error) {
    console.error('Update offer status error:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

export default router;
