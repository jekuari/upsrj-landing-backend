import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = "mongodb://root:example@localhost:27017/LandingPage?authSource=admin";
const ADMIN_USER_ID = "68fc2a47f43dafb3086fc294";

const modules = [
  "Puck", "Images", "Files", "Videos", "Blog", "Navbar",
  "Templates", "EmailTemplates", "Leads", "AccessRights",
  "Authentication", "Permission",
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("LandingPage");
  const systemModules = await db.collection("system_modules").find({}).toArray();
  const moduleMap = {};
  for (const m of systemModules) {
    moduleMap[m.moduleName] = m._id;
  }
  const userId = new ObjectId(ADMIN_USER_ID);
  const accessRights = [];
  for (const modName of modules) {
    const moduleId = moduleMap[modName];
    if (!moduleId) {
      console.log(`  ⚠ Module not found: ${modName}`);
      continue;
    }
    accessRights.push({
      moduleId,
      moduleName: modName,
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      userId,
    });
  }
  if (accessRights.length > 0) {
    await db.collection("access_rights").deleteMany({ userId });
    await db.collection("access_rights").insertMany(accessRights);
    console.log(`✅ Granted all permissions for ${accessRights.length} modules to user ${ADMIN_USER_ID}`);
  }
  await client.close();
}

main().catch(console.error);
