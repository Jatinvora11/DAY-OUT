import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for the given user ID.
 * @param {string} id - The MongoDB user document _id
 * @returns {string} Signed JWT string
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export default generateToken;
