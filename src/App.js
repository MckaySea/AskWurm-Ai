"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import ReactMarkdown from "react-markdown"
import "./index.css"

const MatrixBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById("matrix-canvas")
    const context = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const katakana =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン"
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const nums = "0123456789"
    const alphabet = katakana + latin + nums

    const fontSize = 16
    const columns = canvas.width / fontSize

    const rainDrops = []

    for (let x = 0; x < columns; x++) {
      rainDrops[x] = 1
    }

    const draw = () => {
      context.fillStyle = "rgba(0, 0, 0, 0.05)"
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = "#4ade80"
      context.font = fontSize + "px monospace"

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
        context.fillText(text, i * fontSize, rainDrops[i] * fontSize)

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0
        }
        rainDrops[i]++
      }
    }

    const interval = setInterval(draw, 30)

    return () => clearInterval(interval)
  }, [])

  return <canvas id="matrix-canvas" className="matrix-bg"></canvas>
}

const App = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const chatContainerRef = useRef(null)
  const controls = useAnimation()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      transition: { delay: i * 0.1 },
    }))
  }, [controls])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inputMessage.trim() === "") return

    const newMessage = { text: inputMessage, sender: "user" }
    setMessages([...messages, newMessage])
    setInputMessage("")
    setLoading(true)

    try {
      const response = await fetch("https://askwurm-server-hu9dp.kinsta.app/ask-wurm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: inputMessage }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text:
              "You're sending messages too fast. Try again in a few seconds.",
            sender: "ai",
          },
        ])
      } else {
        const aiResponse = { text: data.response, sender: "ai" }
        setMessages((prevMessages) => [...prevMessages, aiResponse])
      }
    } catch (error) {
      console.error("Error fetching AI response:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Error connecting to server.", sender: "ai" },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400 font-mono p-4">
      <MatrixBackground />
      <header className="text-center mb-4">
        <motion.h1 className="text-4xl font-bold mb-2">
          {Array.from("AskWurm").map((letter, index) => (
            <motion.span key={index} initial={{ opacity: 0 }} animate={controls} custom={index}>
              {letter}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          className="text-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Please be very specific and ask questions about Wurm Online! - BETA 0.3
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

      <main className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
        <div className="terminal-window flex-grow flex flex-col">
          <div className="terminal-header">
            <div className="terminal-button close"></div>
            <div className="terminal-button minimize"></div>
            <div className="terminal-button maximize"></div>
          </div>
          <div ref={chatContainerRef} id="chat-container" className="terminal-content flex-grow overflow-y-auto p-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`mb-4 ${message.sender === "user" ? "text-yellow-300" : "text-green-400"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className={`font-bold ${message.sender === "user" ? "text-blue-400" : "text-red-400"}`}>
                  {message.sender === "user" ? "User@AskWurm:~$ " : "AI@AskWurm:~$ "}
                </span>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </motion.div>
            ))}
            {loading && (
              <div className="text-green-400">
                <span className="font-bold text-red-400">AI@AskWurm:~$ </span>
                Thinking<span className="animate-pulse">...</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex mt-4">
          <div className="flex-grow flex items-center bg-gray-800 text-green-400 border-2 border-green-400 rounded-l-lg px-2">
          <span className="text-blue-400 mr-2 hidden sm:inline">User@AskWurm:~$</span>
<span className="text-blue-400 mr-2 sm:hidden">~$</span>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow bg-transparent focus:outline-none"
              placeholder="Type your message..."
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-black font-bold py-2 px-4 rounded-r-lg hover:bg-green-500 transition-colors"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
