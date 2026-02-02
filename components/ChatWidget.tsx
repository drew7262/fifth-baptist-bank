
import React, { useState, useRef, useEffect } from 'react';
import { useBankData } from '../context/BankDataContext';
import { ChatMessage, User } from '../types';
import { generateId } from '../utils/helpers';
import { XIcon, MessageSquareIcon } from './icons';

const ChatWidget: React.FC<{ user: User }> = ({ user }) => {
    const { dispatch } = useBankData();
    const [isOpen, setIsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastSeenAdminMessageId = useRef<string | null>(null);

    const chatMessages = user.chat?.messages || [];
    
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isOpen]);
    
    // Automatically open chat if a NEW admin message arrives and the chat is closed.
    useEffect(() => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        
        if (!isOpen && lastMessage && lastMessage.sender === 'admin' && lastMessage.id !== lastSeenAdminMessageId.current) {
           setIsOpen(true);
        }
        
        // Update the last seen message ID regardless
        if (lastMessage && lastMessage.sender === 'admin') {
            lastSeenAdminMessageId.current = lastMessage.id;
        }

    }, [chatMessages, isOpen]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const message: ChatMessage = {
            id: generateId(),
            sender: 'customer',
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
            read: false,
        };

        dispatch({
            type: 'SEND_CHAT_MESSAGE',
            payload: { userId: user.id, message }
        });

        setNewMessage('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-400 transition-colors z-50"
                aria-label="Open chat"
            >
                 <MessageSquareIcon className="w-6 h-6"/>
            </button>
        );
    }
    
    return (
        <div className="fixed bottom-5 right-5 w-full max-w-sm h-[28rem] bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50">
            <div className="p-3 flex justify-between items-center border-b border-slate-700 flex-shrink-0">
                <h3 className="font-bold text-white">Live Chat Support</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex mb-2 ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg py-1 px-3 max-w-[80%] ${msg.sender === 'customer' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-slate-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button type="submit" className="bg-cyan-500 p-2 rounded-lg text-white font-semibold">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;
