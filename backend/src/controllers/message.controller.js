import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversationsForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    //   Aggregate messages to get the latest conversation for each user
    const conversations = await Message.aggregate([
      {
        //   1- Filter messages where the logged-in user is either the sender or receiver
        $match: {
          $or: [{ sender: loggedInUserId }, { receiver: loggedInUserId }],
        },
      },
      //   2- Group messages by the other user's ID and get the latest message timestamp
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $max: "$createdAt" },
        },
      },
      //   3- Sort the conversations by the latest message timestamp in descending order
      { $sort: { lastMessage: -1 } },
      //   4- Lookup user details for each conversation
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      //   5- Replace the root with the user details and exclude the clerkId field
      {
        $replaceRoot: {
          newRoot: {
            $first: "$user",
          },
        },
      },
      //   6- Project the fields to exclude clerkId
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations for sidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userToChatId },
        { sender: userToChatId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setMessages = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res
          .status(500)
          .json({ error: "ImageKit configuration is missing" });
      }

      const url = await uploadChatMedia(req.file);

      if (req.file.mimetype.startsWith("image/")) {
        imageUrl = url;
      } else if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });
    await newMessage.save();

    //   todo: Emit the new message to the receiver using socket.io (if implemented)

    res.status(201).json({ newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
