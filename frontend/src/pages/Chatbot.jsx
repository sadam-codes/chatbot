import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import { TbMessageChatbotFilled } from "react-icons/tb";
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Upload a PDF and ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return toast.error("Please type a message");
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLoading(true);
    const loadingToast = toast.loading("Thinking...");
    setInput("");
    try {
      const res = await axios.get("http://localhost:3000/chatbot/chat", {
        params: { q: input },
      });
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.text }]);
    } catch (err) {
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Failed to get response." },
      ]);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:3000/chatbot/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("PDF uploaded and processed!");
      setMessages([
        { sender: "bot", text: "PDF uploaded! Now ask me anything." },
      ]);
    } catch {
      toast.error("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center px-2"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
      }}
    >
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl h-[100vh] bg-white/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-black via-gray-900 to-indigo-900 text-white text-center py-6 text-3xl font-bold shadow-md flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 justify-center">
            <TbMessageChatbotFilled  className="text-4xl" />
             Chatbot
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="mx-auto mt-3 block w-60 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-white via-indigo-50 to-white space-y-4 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center mr-3 shadow text-xl">
                  🤖
                </div>
              )}
              <div
                className={`px-5 py-3 rounded-2xl shadow max-w-[75%] text-base break-words ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-black text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-black text-white rounded-full flex items-center justify-center ml-3 shadow text-xl">
                  🧑
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 italic">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t bg-white p-5 flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnter}
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-5 py-3 border-2 border-indigo-200 rounded-full outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 transition text-base"
            disabled={loading || uploading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || uploading}
            className="bg-gradient-to-br from-indigo-600 to-black text-white px-7 py-3 rounded-full font-semibold shadow transition flex items-center gap-2 disabled:opacity-60 text-base"
          >
            <IoSend className="text-xl" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;