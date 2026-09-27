import ContactMessage from '../models/ContactMessage.js';

// POST /api/contact
export const submitMessage = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const contactMessage = await ContactMessage.create({ name, email, message });
    return res.status(201).json({ message: 'Message sent successfully', data: contactMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// GET /api/contact  (admin only)
export const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};
