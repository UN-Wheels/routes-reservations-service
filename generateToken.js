const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    id: "driver123",
    role: "DRIVER"
  },
  "supersecretkey"
);

console.log(token);