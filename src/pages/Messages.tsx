import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { useNavigate } from "react-router-dom";
import dotenv from "dotenv";

const socket = socketIOClient("http://localhost:5000");

const Messages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [userId, setUserId] = useState("");
  const [recipients, setRecipients] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user ID from localStorage
    const loggedInUserId = localStorage.getItem("userId");
    setUserId(loggedInUserId || "");

    if (!loggedInUserId) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch recipients
    const fetchRecipients = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/recipients/${loggedInUserId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch recipients:",
            response.status,
            await response.text()
          );
          return;
        }

        const data = await response.json();
        setRecipients(data);
      } catch (err) {
        console.error("Error fetching recipients:", err);
      }
    };

    fetchRecipients();

    // Socket listener for new messages
    socket.on("receiveMessage", (newMessage: any) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Fetch messages between the logged-in user and the receiver
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/conversation/${loggedInUserId}/${receiverId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch messages:",
            response.status,
            await response.text()
          );
          return;
        }

        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (receiverId) {
      fetchMessages();
    }

    // Cleanup socket listener
    return () => {
      socket.off("receiveMessage");
    };
  }, [receiverId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT
    localStorage.removeItem("userId"); // Remove User ID
    navigate("/login"); // Redirect to login page
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !receiverId || !userId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Emit message through socket (server should broadcast this to recipient)
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId,
        content: message,
      });

      // Send message to the API to save in database
      const response = await fetch(`http://localhost:5000/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId,
          content: message,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send message to API");
        return;
      }

      setMessage(""); // Clear the input field
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Messages</h2>

        {/* Receiver Dropdown */}
        <div className="mb-4">
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a recipient</option>
            {recipients.map((recipient) => (
              <option key={recipient._id} value={recipient._id}>
                {recipient.username || recipient._id}
              </option>
            ))}
          </select>
        </div>

        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-md">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                msg.senderId === userId
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-300 text-black"
              }`}
            >
              <p>{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Send Message */}
        <div className="flex">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Messages;
