const mongoose = require("mongoose");
const path = require("path");

// Load env
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI not set in .env.local"); process.exit(1); }
  
  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB");

  // Define schemas inline for the seed script
  const ProjectSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true } }, { timestamps: true });
  const UserSchema = new mongoose.Schema({ email: { type: String, unique: true }, name: String, projectId: mongoose.Schema.Types.ObjectId, role: String });
  const ProductInstanceSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, productType: String, nameSpace: String, integrations: { shopify: Boolean, crm: Boolean } });
  const ConversationSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, productInstanceId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId, title: String }, { timestamps: true });
  const MessageSchema = new mongoose.Schema({ conversationId: mongoose.Schema.Types.ObjectId, role: String, content: String, steps: [String] }, { timestamps: true });
  const WidgetSchema = new mongoose.Schema({ type: String, label: String, dataKey: String, integrationKey: String, order: Number }, { _id: false });
  const SectionSchema = new mongoose.Schema({ id: String, label: String, order: Number, widgets: [WidgetSchema] }, { _id: false });
  const DashboardConfigSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, projectSlug: { type: String, unique: true }, sections: [SectionSchema] }, { timestamps: true });

  const Project = mongoose.model("Project", ProjectSchema);
  const User = mongoose.model("User", UserSchema);
  const ProductInstance = mongoose.model("ProductInstance", ProductInstanceSchema);
  const Conversation = mongoose.model("Conversation", ConversationSchema);
  const Message = mongoose.model("Message", MessageSchema);
  const DashboardConfig = mongoose.model("DashboardConfig", DashboardConfigSchema);

  // Clear
  await Promise.all([Project.deleteMany({}), User.deleteMany({}), ProductInstance.deleteMany({}), Conversation.deleteMany({}), Message.deleteMany({}), DashboardConfig.deleteMany({})]);
  console.log("✓ Cleared existing data");

  // Projects
  const acme = await Project.create({ name: "Acme Retail", slug: "acme-retail" });
  const demo = await Project.create({ name: "Demo CRM Co", slug: "demo-crm" });

  // Users
  const acmeAdmin = await User.create({ email: "admin@acme.com", name: "Alex Admin", projectId: acme._id, role: "admin" });
  const acmeMember = await User.create({ email: "member@acme.com", name: "Morgan Member", projectId: acme._id, role: "member" });
  const demoAdmin = await User.create({ email: "admin@demo.com", name: "Dana Demo", projectId: demo._id, role: "admin" });

  // Product Instances
  const acmeInst = await ProductInstance.create({ projectId: acme._id, productType: "ai-sales-assistant", nameSpace: "acme-retail", integrations: { shopify: true, crm: false } });
  const demoInst = await ProductInstance.create({ projectId: demo._id, productType: "ai-sales-assistant", nameSpace: "demo-crm", integrations: { shopify: false, crm: true } });

  // Sample conversations
  const convo1 = await Conversation.create({ projectId: acme._id, productInstanceId: acmeInst._id, userId: acmeMember._id, title: "Order tracking help" });
  await Message.create([
    { conversationId: convo1._id, role: "user", content: "Where is my order #1042?" },
    { conversationId: convo1._id, role: "assistant", content: "Order #1042 (2x Classic Tee) has shipped and is on its way!", steps: ["Fetching Shopify order data...", "Generating response..."] },
  ]);
  const convo2 = await Conversation.create({ projectId: acme._id, productInstanceId: acmeInst._id, userId: acmeMember._id, title: "Return policy question" });
  await Message.create([
    { conversationId: convo2._id, role: "user", content: "What is your return policy?" },
    { conversationId: convo2._id, role: "assistant", content: "We offer 30-day hassle-free returns on all items." },
  ]);

  // ─── Dashboard Configs ─────────────────────────────────────────────────────
  // THIS IS THE KEY DOCUMENT — edit this in MongoDB to change the admin dashboard
  await DashboardConfig.create({
    projectId: acme._id,
    projectSlug: "acme-retail",
    sections: [
      {
        id: "overview", label: "Overview", order: 1,
        widgets: [
          { type: "stat-card", label: "Total Conversations", dataKey: "totalConversations", order: 1 },
          { type: "stat-card", label: "Total Messages", dataKey: "totalMessages", order: 2 },
          { type: "stat-card", label: "Active Users", dataKey: "activeUsers", order: 3 },
        ],
      },
      {
        id: "integrations", label: "Integrations", order: 2,
        widgets: [
          { type: "integration-status", label: "Shopify", integrationKey: "shopify", order: 1 },
          { type: "integration-status", label: "CRM", integrationKey: "crm", order: 2 },
        ],
      },
      {
        id: "activity", label: "Recent Activity", order: 3,
        widgets: [
          { type: "recent-conversations", label: "Recent Conversations", order: 1 },
          { type: "user-list", label: "Team Members", order: 2 },
        ],
      },
    ],
  });

  await DashboardConfig.create({
    projectId: demo._id,
    projectSlug: "demo-crm",
    sections: [
      {
        id: "overview", label: "Overview", order: 1,
        widgets: [
          { type: "stat-card", label: "Total Conversations", dataKey: "totalConversations", order: 1 },
          { type: "stat-card", label: "Active Users", dataKey: "activeUsers", order: 2 },
        ],
      },
      {
        id: "integrations", label: "Integrations", order: 2,
        widgets: [
          { type: "integration-status", label: "CRM", integrationKey: "crm", order: 1 },
        ],
      },
    ],
  });

  console.log("\n✅ Seed complete!\n");
  console.log("Login as:");
  console.log(`  admin@acme.com  → Admin · Acme Retail     [id: ${acmeAdmin._id}]`);
  console.log(`  member@acme.com → Member · Acme Retail    [id: ${acmeMember._id}]`);
  console.log(`  admin@demo.com  → Admin · Demo CRM Co     [id: ${demoAdmin._id}]`);

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
