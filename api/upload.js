import { put } from '@vercel/blob';
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { readable, filename } = await parseFile(req);
  const blob = await put(filename, readable, { access: 'public' });

  res.status(200).json({ url: blob.url });
}

async function parseFile(req) {
  const boundary = req.headers['content-type'].split('boundary=')[1];
  const chunks = [];

  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const filename = /filename="(.+?)"/.exec(buffer.toString())[1];
  const start = buffer.indexOf('\r\n\r\n') + 4;
  const end = buffer.lastIndexOf(`------${boundary}--`) - 2;
  const fileBuffer = buffer.slice(start, end);

  return {
    filename,
    readable: require('stream').Readable.from(fileBuffer)
  };
}
