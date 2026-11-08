import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Send,
  MessageSquare,
  User,
  Phone,
  Video,
  CheckCheck,
  Paperclip,
} from 'lucide-react';
import api from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import Button from '../../components/common/Button.jsx';
import { setActiveCall } from '../../redux/slices/callSlice.js';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { startLocalMedia, getPeerConnection } from '../../services/webrtc.js';

const Messages = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const conversationParam = searchParams.get('conversation');

  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Fetch all conversations
  useEffect(() => {
    api
      .get('/chat/conversations')
      .then((res) => {
        if (res?.data) {
          setConversations(res.data);
          if (conversationParam) {
            const found = res.data.find((c) => c._id === conversationParam);
            if (found) setActiveConversation(found);
          } else if (res.data.length > 0) {
            setActiveConversation(res.data[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [conversationParam]);

  // Join socket room and fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const socket = getSocket();
    socket.emit('chat:join', { conversationId: activeConversation._id });

    // Load message history
    api
      .get(`/chat/conversations/${activeConversation._id}/messages`)
      .then((res) => {
        if (res?.data) setMessages(res.data);
      })
      .catch((err) => console.error(err));

    // Listen for incoming messages
    const handleReceivedMessage = (newMsg) => {
      if (newMsg.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on('message:received', handleReceivedMessage);

    return () => {
      socket.off('message:received', handleReceivedMessage);
    };
  }, [activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const socket = getSocket();
    socket.emit('message:send', {
      conversationId: activeConversation._id,
      text: inputText,
      attachments: [],
    });

    setInputText('');
  };

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return { name: 'Support / Provider' };
    return conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
  };

  const handleCallOther = async (callType = 'audio') => {
    const other = getOtherParticipant(activeConversation);
    if (!other?._id) return;

    try {
      const res = await api.post('/calls/initiate', {
        receiverId: other._id,
        bookingId: activeConversation.bookingId?._id,
        callType,
      });

      if (res?.data) {
        const stream = await startLocalMedia(callType);
        const pc = await getPeerConnection();
        if (stream) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const socket = getSocket();
        socket.emit('call:offer', {
          receiverId: other._id,
          offer,
          callId: res.data.callId,
          callType,
        });

        dispatch(
          setActiveCall({
            targetUser: { id: other._id, name: other.name, role: other.role },
            callId: res.data.callId,
            callType,
            status: 'calling',
          })
        );
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Call failed' }));
    }
  };

  const otherUser = getOtherParticipant(activeConversation);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium h-[calc(100vh-140px)] flex overflow-hidden">
      {/* Conversations List (Left) */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900">Direct Messages</h2>
          <p className="text-[11px] text-slate-400">Authenticated booking communications</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No active conversations.</div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isSelected = activeConversation?._id === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {other?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{other?.name}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{other?.role}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Chat Thread (Right) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40">
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  {otherUser?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{otherUser?.name}</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected Securely
                  </span>
                </div>
              </div>

              {/* Call triggers */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" icon={Phone} onClick={() => handleCallOther('audio')}>
                  Call Audio
                </Button>
                <Button variant="outline" size="sm" icon={Video} onClick={() => handleCallOther('video')}>
                  Video
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  This conversation has begun. Say hello!
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId?._id === user._id || m.senderId === user._id;

                  return (
                    <div
                      key={m._id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-full focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50"
              />
              <Button type="submit" variant="primary" size="sm" icon={Send} className="rounded-full px-4">
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Select a conversation on the left to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
