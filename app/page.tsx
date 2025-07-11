'use client';
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');

  const sendMessage = async () => {
    try {
      const res = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      setReply(data.reply || data.error);
    } catch (error) {
      setReply('Erreur : ' + (error as Error).message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Chat avec Grok-4 Heavy</h1>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tape ton message ici..."
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px 20px' }}>Envoyer</button>
      <p style={{ marginTop: '20px' }}><strong>Réponse :</strong> {reply}</p>
    </div>
  );
}