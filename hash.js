const bcrypt = require("bcryptjs");

(async () => {
  console.log("admin123:", await bcrypt.hash("admin123", 10));
  console.log("user123 :", await bcrypt.hash("user123", 10));
})();
