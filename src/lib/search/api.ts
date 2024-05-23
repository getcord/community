export async function storeChunk(
  index: string,
  chunk: string,
  embedding: any,
  title: string,
  url: string,
) {
  try {
    await fetch(`${process.env.SEARCH_DATA_API_HOST}/api/chatContext`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.COMMUNITY_APP_SECRET,
        index,
        chunk,
        embedding,
        title,
        url,
      }),
    });
  } catch (e) {
    console.log(`Failed to store chunk: ${JSON.stringify({ index, url })}`, e);
  }
}

export async function deleteURLFromIndex(index: string, url: string) {
  try {
    await fetch(`${process.env.SEARCH_DATA_API_HOST}/api/chatContext`, {
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
  } catch (e) {
    console.error(
      `Failed to delete url from index: ${JSON.stringify({ index, url })}`,
      e,
    );
  }
}
