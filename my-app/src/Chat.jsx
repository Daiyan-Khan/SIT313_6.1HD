import React, { useState, useRef, useEffect } from 'react';
import './css/Chat.css';

/**
 * Chat component that provides a basic chatbot interface.
 * It allows the user to send messages, and get responses from a server.
 *
 * @component
 */
const Chat = () => {
    /**
     * State to manage whether the chat is open or closed.
     * @type {boolean}
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * State to manage the list of messages.
     * Each message is an object with the text of the message and the sender.
     * @type {Array<{text: string, sender: string}>}
     */
    const [messages, setMessages] = useState([]);

    /**
     * State to manage the current value of the input field.
     * @type {string}
     */
    const [inputValue, setInputValue] = useState('');

    /**
     * Reference for the end of the messages list, used to scroll to the bottom automatically.
     * @type {Object}
     */
    const messagesEndRef = useRef(null); 

    /**
     * Toggles the open/closed state of the chat.
     */
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    /**
     * Handles sending a message.
     * Sends the user input to the server, receives the response, and updates the messages.
     */
    const handleSend = async () => {
        if (inputValue.trim()) {
            // Add user's message to the chat
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: inputValue, sender: 'User' }
            ]);

            const userMessage = inputValue;
            setInputValue('');

            try {
                // Send the user's message to the backend server
                const response = await fetch('http://localhost:5000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: userMessage }),
                });

                // If the response is not successful, throw an error
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Parse the server's response and add it to the chat
                const data = await response.json();
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: data.message, sender: 'ChatGPT' }
                ]);
            } catch (error) {
                console.error('Error sending message to the server:', error);
                // Show an error message in the chat
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Error: Could not receive a response from ChatGPT.', sender: 'ChatGPT' }
                ]);
            }
        }
    };

    /**
     * Scrolls the chat to the bottom when new messages are added.
     */
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
