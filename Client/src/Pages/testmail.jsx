
import emailjs from 'emailjs-com';

/**
 *
 * @param {string} email
 * @param {string} code 
 * @returns {Promise<void>}
 */
const emailverification = async (email, code) => {
  const templateParams = {
    to_email: email,
    verification_code: code,
  };

  try {
    await emailjs.send(
      'service_am3wu4z',       
      'template_4e5oich',      
      templateParams,
      'udZHxacdyJA1xBUHD'      
    );
    console.log('✅ Email verification code sent successfully.');
  } catch (error) {
    console.error('❌ Failed to send email verification code:', error);
    throw error;
  }
};
export default emailverification
