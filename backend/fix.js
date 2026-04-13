const db = require('./config/db');

async function fix() {
  await db.initializeDatabase();
  await db.query("UPDATE users SET password_hash = '$2a$10$Ehtq4tRLmZNdKWwHfqj8h.OeEYHK6cSBhHD.o04a7PDnq.lb20wKS' WHERE username = 'admin'");
  await db.query("UPDATE users SET password_hash = '$2a$10$FZcjyu8l9SCvyMsyxjmG3.I7X5UxCz1gDG8Xwuw4M/UGQkwtLBm7C' WHERE username = 'pharmacist1'");
  console.log("PASSWORDS FIXED!");
  process.exit(0);
}

fix();