import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IProject extends Document {
  name: string;
  slug: string;
  createdAt: Date;
}
const ProjectSchema = new Schema<IProject>(
  { name: { type: String, required: true }, slug: { type: String, required: true, unique: true } },
  { timestamps: true }
);
export const Project = models.Project || model<IProject>("Project", ProjectSchema);

export interface IUser extends Document {
  email: string;
  name: string;
  projectId: mongoose.Types.ObjectId;
  role: "admin" | "member";
}
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
});
export const User = models.User || model<IUser>("User", UserSchema);

export interface IProductInstance extends Document {
  projectId: mongoose.Types.ObjectId;
  productType: string;
  nameSpace: string;
  integrations: { shopify: boolean; crm: boolean };
}
const ProductInstanceSchema = new Schema<IProductInstance>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  productType: { type: String, required: true },
  nameSpace: { type: String, required: true },
  integrations: { shopify: { type: Boolean, default: false }, crm: { type: Boolean, default: false } },
});
export const ProductInstance = models.ProductInstance || model<IProductInstance>("ProductInstance", ProductInstanceSchema);

export interface IConversation extends Document {
  projectId: mongoose.Types.ObjectId;
  productInstanceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
const ConversationSchema = new Schema<IConversation>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    productInstanceId: { type: Schema.Types.ObjectId, ref: "ProductInstance", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Conversation" },
  },
  { timestamps: true }
);
export const Conversation = models.Conversation || model<IConversation>("Conversation", ConversationSchema);

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  createdAt: Date;
}
const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    steps: [{ type: String }],
  },
  { timestamps: true }
);
export const Message = models.Message || model<IMessage>("Message", MessageSchema);

export interface IWidget {
  type: "stat-card" | "integration-status" | "recent-conversations" | "user-list";
  label: string;
  dataKey?: string;
  integrationKey?: string;
  order: number;
}
export interface ISection {
  id: string;
  label: string;
  order: number;
  widgets: IWidget[];
}
export interface IDashboardConfig extends Document {
  projectId: mongoose.Types.ObjectId;
  projectSlug: string;
  sections: ISection[];
}
const WidgetSchema = new Schema<IWidget>(
  { type: { type: String, enum: ["stat-card", "integration-status", "recent-conversations", "user-list"], required: true }, label: { type: String, required: true }, dataKey: String, integrationKey: String, order: { type: Number, default: 0 } },
  { _id: false }
);
const SectionSchema = new Schema<ISection>(
  { id: { type: String, required: true }, label: { type: String, required: true }, order: { type: Number, default: 0 }, widgets: [WidgetSchema] },
  { _id: false }
);
const DashboardConfigSchema = new Schema<IDashboardConfig>(
  { projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true }, projectSlug: { type: String, required: true, unique: true }, sections: [SectionSchema] },
  { timestamps: true }
);
export const DashboardConfig = models.DashboardConfig || model<IDashboardConfig>("DashboardConfig", DashboardConfigSchema);
