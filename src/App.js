import { useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import "./index.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
  
    const newMessage = { text: inputMessage, sender: "user" };
    setMessages([...messages, newMessage]);
    setInputMessage("");
    setLoading(true);
  
    try {
      const response = await fetch("https://askwurm-server-hu9dp.kinsta.app/ask-wurm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: inputMessage }),
      });
  
      const data = await response.json();
  
      if (response.status === 429) { // Rate limit response
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "You're sending messages too fast. Try again in a few seconds.", sender: "ai" },
        ]);
      } else {
        const aiResponse = { text: data.response, sender: "ai" };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Error connecting to server.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <header className="text-center mb-8">
        <motion.h1
          className="text-4xl font-bold mb-2 animate-pulse"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          AskWurm
        </motion.h1>
        <motion.p
          className="text-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Please be very specific and ask questions about Wurm Online! - BETA 0.1
        </motion.p>
        <motion.p
          className="text-sm"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Send Bug reports to discord: mckay_
        </motion.p>
      </header>

      <main className="max-w-2xl mx-auto">
        <div
          id="chat-container"
          className="bg-gray-900 border-2 border-green-400 rounded-lg p-4 h-96 overflow-y-auto mb-4"
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.sender === "user" ? "bg-blue-600 text-white" : "bg-green-600 text-black"
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
          {loading && <p className="text-center text-gray-400">Thinking...</p>}
        </div>

        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow bg-gray-800 text-green-400 border-2 border-green-400 rounded-l-lg p-2 focus:outline-none"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-green-600 text-black font-bold py-2 px-4 rounded-r-lg hover:bg-green-500 transition-colors"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default App;
