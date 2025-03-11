const app = require("./app/app");
require("dotenv").config();
const { PORT = 9090 } = process.env;

app.listen(PORT);
