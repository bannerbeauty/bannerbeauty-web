import type { NextRequest } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

const CONTAINER = 'neighbor-images';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const filename = `neighbor-${Date.now()}.${ext}`;

    const buffer = await req.arrayBuffer();

    const blobService = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const container = blobService.getContainerClient(CONTAINER);
    const blockBlob = container.getBlockBlobClient(filename);

    await blockBlob.upload(buffer, buffer.byteLength, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    return Response.json({ url: blockBlob.url });
  } catch (err) {
    console.error('Neighbor image upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
