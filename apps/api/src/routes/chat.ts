import { Router } from "express";
import prisma from "../config/db";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { SavePublicKeySchema } from "@studyspace/shared";
import { getPresignedDownloadUrl } from "../utils/s3";

const router = Router();

// Require authentication for all chat routes
router.use(authMiddleware);

/**
 * POST /keys - Save or update the authenticated user's base64 public key
 */
router.post("/keys", validateBody(SavePublicKeySchema), async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { publicKey } = req.body;

    const savedKey = await prisma.publicKey.upsert({
      where: { userId },
      update: { publicKey },
      create: { userId, publicKey },
    });

    return res.json(savedKey);
  } catch (error) {
    console.error("Save public key error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /keys/:userId - Retrieve target user's public key
 */
router.get("/keys/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const keyRecord = await prisma.publicKey.findUnique({
      where: { userId },
    });

    if (!keyRecord) {
      return res.status(404).json({ message: "Public key not found for this user" });
    }

    return res.json({ userId, publicKey: keyRecord.publicKey });
  } catch (error) {
    console.error("Fetch public key error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /user/:userId - Retrieve user profile details for chat
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const signedAvatar = targetUser.avatarUrl ? await getPresignedDownloadUrl(targetUser.avatarUrl) : null;

    return res.json({ ...targetUser, avatarUrl: signedAvatar });
  } catch (error) {
    console.error("Fetch chat user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /messages/:recipientId - Retrieve historical encrypted messages
 */
router.get("/messages/:recipientId", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { recipientId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId },
          { senderId: recipientId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
        recipient: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
      },
    });

    const formatted = await Promise.all(
      messages.map(async (m) => ({
        ...m,
        sender: m.sender ? {
          ...m.sender,
          avatarUrl: m.sender.avatarUrl ? await getPresignedDownloadUrl(m.sender.avatarUrl) : null,
        } : m.sender,
        recipient: m.recipient ? {
          ...m.recipient,
          avatarUrl: m.recipient.avatarUrl ? await getPresignedDownloadUrl(m.recipient.avatarUrl) : null,
        } : m.recipient,
      }))
    );

    return res.json(formatted);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /conversations - Retrieve list of user conversations
 */
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user!.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        recipient: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
    });

    const partnerMap = new Map<string, { user: any; lastMessage: any }>();

    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.recipient : msg.sender;
      if (!partnerMap.has(partner.id)) {
        const signedAvatar = partner.avatarUrl ? await getPresignedDownloadUrl(partner.avatarUrl) : null;
        partnerMap.set(partner.id, {
          user: { ...partner, avatarUrl: signedAvatar },
          lastMessage: {
            id: msg.id,
            encryptedPayload: msg.encryptedPayload,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          },
        });
      }
    }

    return res.json(Array.from(partnerMap.values()));
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
