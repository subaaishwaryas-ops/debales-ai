import { connectDB } from "../db";
import { Project, User, ProductInstance, Conversation, Message, DashboardConfig } from "../models";

export async function getProjectBySlug(slug: string) {
  await connectDB();
  return Project.findOne({ slug }).lean();
}

export async function getAllUsers() {
  await connectDB();
  return User.find({}).populate("projectId", "name slug").lean();
}

export async function getUsersByProject(projectId: string) {
  await connectDB();
  return User.find({ projectId }).lean();
}

export async function getProductInstanceByProject(projectId: string) {
  await connectDB();
  return ProductInstance.findOne({ projectId }).lean();
}

export async function toggleIntegration(projectId: string, integration: "shopify" | "crm", enabled: boolean) {
  await connectDB();
  return ProductInstance.findOneAndUpdate({ projectId }, { $set: { [`integrations.${integration}`]: enabled } }, { new: true }).lean();
}

export async function getConversationsByUser(userId: string, projectId: string) {
  await connectDB();
  return Conversation.find({ userId, projectId }).sort({ updatedAt: -1 }).lean();
}

export async function getConversationById(id: string) {
  await connectDB();
  return Conversation.findById(id).lean();
}

export async function createConversation(userId: string, projectId: string, productInstanceId: string, title?: string) {
  await connectDB();
  const c = await Conversation.create({ userId, projectId, productInstanceId, title: title ?? "New Conversation" });
  return c.toObject();
}

export async function getMessagesByConversation(conversationId: string) {
  await connectDB();
  return Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
}

export async function saveMessage(conversationId: string, role: "user" | "assistant", content: string, steps?: string[]) {
  await connectDB();
  const msg = await Message.create({ conversationId, role, content, steps });
  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
  return msg.toObject();
}

export async function getRecentConversations(projectId: string, limit = 5) {
  await connectDB();
  return Conversation.find({ projectId }).sort({ updatedAt: -1 }).limit(limit).populate("userId", "name email").lean();
}

export async function getDashboardStats(projectId: string) {
  await connectDB();
  const convos = await Conversation.find({ projectId }, "_id").lean();
  const ids = convos.map((c) => c._id);
  const [totalConversations, totalMessages, activeUsers] = await Promise.all([
    Conversation.countDocuments({ projectId }),
    Message.countDocuments({ conversationId: { $in: ids } }),
    User.countDocuments({ projectId }),
  ]);
  return { totalConversations, totalMessages, activeUsers };
}

export async function getDashboardConfig(projectSlug: string) {
  await connectDB();
  return DashboardConfig.findOne({ projectSlug }).lean();
}
