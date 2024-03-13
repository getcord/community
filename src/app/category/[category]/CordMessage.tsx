"use client";

import { experimental, thread } from "@cord-sdk/react";
import { MessageContent, CoreMessageData } from "@cord-sdk/types";


export default function CordMessage({
  message: serverMessage,
}: {
  message: CoreMessageData;
}) {
  const data = thread.useMessage(serverMessage.id);
  const message = data ?? serverMessage;
  return (
      <experimental.MessageContent
        key={message.id}
        content={message.content as MessageContent & string}
        attachments={[]}
        edited={false}
      />
  );
}
