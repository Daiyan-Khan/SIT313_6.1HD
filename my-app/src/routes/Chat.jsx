import React, { useState, useRef, useEffect } from 'react';
import './css/Chat.css';

const Chat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null); // Reference for the messages container

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (inputValue.trim()) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: inputValue, sender: 'User' }
            ]);

            const userMessage = inputValue;
            setInputValue('');

            try {
                const response = await fetch('http://localhost:5000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: userMessage }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: data.message, sender: 'ChatGPT' }
                ]);
            } catch (error) {
                console.error('Error sending message to the server:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Error: Could not receive a response from ChatGPT.', sender: 'ChatGPT' }
                ]);
            }
        }
    };

    // Scroll to the bottom of the messages when new message is added
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]); // Runs every time the messages array changes

    return (
        <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
            <button className="chat-toggle" onClick={toggleChat}>
                {isOpen ? '-' : '+'}
            </button>
            {isOpen && (
                <div className="chat-box">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender.toLowerCase()}`}>
                                <strong>{msg.sender}: </strong>{msg.text}
                            </div>
                        ))}
                        {/* This div is for scrolling to the bottom */}
                        <div ref={messagesEndRef} />
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={handleSend}>Send</button>
                </div>
            )}
        </div>
    );
};

export default Chat;
