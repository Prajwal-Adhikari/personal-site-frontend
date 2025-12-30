import React from 'react';
import ChatWidget from '../components/chat/ChatWidget';

const ContactPage: React.FC = () => {
  return (
    <section className="section">
      <h2>Contact</h2>
      <p>
        The backend contact form will come later. For now, you can{' '}
        <a href="mailto:youremail@example.com">email me</a>.
      </p>

      <ChatWidget />
    </section>
  );
};

export default ContactPage;
