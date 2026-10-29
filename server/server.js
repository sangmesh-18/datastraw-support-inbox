
import "dotenv/config";
import app from "./app.js";
import { startAIWorker } from "./services/ai-worker.service.js";

const PORT = process.env.PORT || 5000;

startAIWorker();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
