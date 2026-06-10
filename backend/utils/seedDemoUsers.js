const User = require("../models/User");

const DEMO_USERS = [
  {
    name: "Demo User One",
    email: "demo1@omnicomm.app",
    password: "Demo1234!",
  },
  {
    name: "Demo User Two",
    email: "demo2@omnicomm.app",
    password: "Demo1234!",
  },
];

const seedDemoUsers = async () => {
  for (const demo of DEMO_USERS) {
    const exists = await User.findOne({ email: demo.email });
    if (exists) continue;

    await User.create(demo);
    console.log(`[seed] Created demo user: ${demo.email}`);
  }
};

module.exports = { seedDemoUsers, DEMO_USERS };
