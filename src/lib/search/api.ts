export async function storeChunk(
  index: string,
  chunk: string,
  embedding: any,
  title: string,
  url: string,
) {
  await fetch(`${process.env.SEARCH_DATA_API_HOST}/api/storeChunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: process.env.SEARCH_DATA_API_SECRET,
      index,
      chunk,
      embedding,
      title,
      url,
    }),
  });
}

export async function deleteURLFromIndex(index: string, url: string) {
  await fetch(`${process.env.SEARCH_DATA_API_HOST}/api/deleteURLFromIndex`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: process.env.SEARCH_DATA_API_SECRET,
      index,
      url,
    }),
  });
}
