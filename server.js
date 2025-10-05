import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// 動作確認用
app.get("/", (_req, res) => {
  res.send("Sleep BGM Render API is running.");
});

// n8n から呼ぶエンドポイント
app.post("/render", async (req, res) => {
  const { videoUrl, bgmUrl, title = "Sleep BGM" } = req.body;

  try {
    const shotstackBody = {
      timeline: {
        tracks: [
          {
            clips: [
              { asset: { type: "video", src: videoUrl }, start: 0, length: 600 },
              { asset: { type: "audio", src: bgmUrl },  start: 0, length: 600 }
            ]
          }
        ]
      },
      output: { format: "mp4", resolution: "1080p" }
    };

    const response = await axios.post(
      "https://api.shotstack.io/stage/render",
      shotstackBody,
      {
        headers: {
          "x-api-key": process.env.SHOTSTACK_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    const msg = err.response?.data || err.message;
    res.status(500).json({ error: msg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
