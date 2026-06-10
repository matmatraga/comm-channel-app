const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Chat = require("../models/Chat");
const CallLog = require("../models/CallLog");

const onlineUsers = new Map();

const emitToUser = (io, userId, event, payload) => {
  for (const [, socket] of io.of("/").sockets) {
    if (socket.user?.id?.toString() === userId.toString()) {
      socket.emit(event, payload);
    }
  }
};

const broadcastPresence = (io) => {
  const online = Array.from(onlineUsers.keys());
  io.emit("presence_update", { onlineUsers: online });
};

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      const fetchUser = await User.findById(user.id).select("-password -__v");
      if (!fetchUser) return next(new Error("Authentication error"));
      socket.user = fetchUser;
      next();
    } catch {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id.toString();
    onlineUsers.set(userId, socket.id);
    broadcastPresence(io);

    socket.on("private_message", async ({ to, content }) => {
      try {
        const chat = await Chat.create({
          sender: socket.user.id,
          receiver: to,
          message: content.message?.trim() || "",
          file: content.file || null,
          deliveredAt: new Date(),
        });

        await chat.populate("sender", "name _id");

        const payload = {
          _id: chat._id,
          from: chat.sender,
          content: chat.message,
          file: chat.file,
          timestamp: chat.createdAt,
          isRead: false,
        };

        emitToUser(io, to, "private_message", payload);
        socket.emit("message_sent", payload);
      } catch (err) {
        console.error("Failed to save chat message:", err);
        socket.emit("message_error", { error: err.message });
      }
    });

    socket.on("typing_start", ({ to }) => {
      emitToUser(io, to, "typing_start", { from: socket.user.id });
    });

    socket.on("typing_stop", ({ to }) => {
      emitToUser(io, to, "typing_stop", { from: socket.user.id });
    });

    socket.on("message_read", async ({ messageIds, partnerId }) => {
      if (!messageIds?.length) return;

      await Chat.updateMany(
        {
          _id: { $in: messageIds },
          receiver: socket.user.id,
          sender: partnerId,
        },
        { $set: { isRead: true, readAt: new Date() } }
      );

      emitToUser(io, partnerId, "read_receipt", {
        messageIds,
        readBy: socket.user.id,
      });
    });

    socket.on("call_accept", async ({ callId }) => {
      const call = await CallLog.findById(callId);
      if (!call) return;

      call.status = "accepted";
      await call.save();

      emitToUser(io, call.caller, "call_accepted", { callId });
    });

    socket.on("call_decline", async ({ callId }) => {
      const call = await CallLog.findById(callId);
      if (!call) return;

      call.status = "declined";
      call.endedAt = new Date();
      await call.save();

      emitToUser(io, call.caller, "call_declined", { callId });
    });

    socket.on("call_end", async ({ callId }) => {
      const call = await CallLog.findById(callId);
      if (!call) return;

      if (call.status === "ringing") call.status = "missed";
      else if (call.status === "accepted") call.status = "completed";

      call.endedAt = new Date();
      if (call.startedAt) {
        call.duration = Math.floor(
          (call.endedAt - call.startedAt) / 1000
        );
      }
      await call.save();

      const partnerId =
        call.caller.toString() === userId
          ? call.callee.toString()
          : call.caller.toString();
      emitToUser(io, partnerId, "call_ended", { callId });
    });

    socket.on("call_signal", ({ to, callId, signal }) => {
      if (!to || !callId || !signal) return;
      emitToUser(io, String(to), "call_signal", {
        callId: String(callId),
        signal,
        from: userId,
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      broadcastPresence(io);
    });
  });
};

module.exports = setupSocket;
module.exports.emitToUser = emitToUser;
