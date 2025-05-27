import formidable from "formidable";
import { put } from "@vercel/blob";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed");

  try {
    const { files } = await parseFile(req);

    // Assuming your input field name is "file"
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to blob storage using readable stream
    const blob = await put(file.originalFilename, file.filepath, {
      access: "public",
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}

function parseFile(req) {
  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}
