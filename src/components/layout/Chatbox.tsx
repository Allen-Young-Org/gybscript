import { useState } from 'react';

const Chatbox = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    text: string;
    isUser: boolean;
  }>>([
    { id: 1, text: 'Hi there! How can I help you today?', isUser: false }
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
     const newUserMessage = {
      id: chatMessages.length + 1,
      text: message,
      isUser: true
    };
    
    setChatMessages([...chatMessages, newUserMessage]);
    setMessage('');
    
     setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        text: "Thanks for your message! Our team will get back to you soon.",
        isUser: false
      };
      
      setChatMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
        Support Chat
      </h3>
      
      <div className="flex-grow overflow-y-auto mb-4 space-y-3">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.isUser
                ? 'bg-accent text-white ml-6'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-6'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-r-md hover:bg-accent/90"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbox;