"use client"

import { Message, thread as threadHooks } from "@cord-sdk/react"


export default function Post({ params }: { params?: { postID: string } }) {

  const threadID = decodeURIComponent(params?.postID || '');
  const thread = threadHooks.useThread(threadID);

  if (!params?.postID) {
    return <p>oops we couldn&apos;t find that post - sorry!</p>
  }

  return <div>
    {/* update with thread name on metadata */}
    <h1>{thread.thread?.id}</h1>
    <Message threadId={threadID} />
  </div>

}