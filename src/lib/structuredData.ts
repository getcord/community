import { CoreThreadData, CoreMessageData } from '@cord-sdk/types';
import { QAPage, WithContext, Answer } from 'schema-dts';

export function getStructuredQAData(
  thread: CoreThreadData,
  messages: CoreMessageData[],
) {
  if (thread.total === 0 || messages.length === 0) {
    return null;
  }

  const title = thread.name;
  const question = messages[0].plaintext;
  const answerMessageID = getAnswerIDMaybe(thread);
  const answerMessage = getAnswerMaybe(answerMessageID, messages);
  const datePublished = messages[0].createdTimestamp;

  return generateQAStructuredData({
    title,
    question,
    answerMessage,
    datePublished,
  });
}

function getAnswerIDMaybe(thread: CoreThreadData) {
  if (
    !('answerMessageID' in thread.metadata) ||
    typeof thread.metadata.answerMessageID !== 'string'
  ) {
    return null;
  }

  return thread.metadata['answerMessageID'];
}

function getAnswerMaybe(
  answerMessageID: string | null,
  messages: CoreMessageData[],
) {
  if (!answerMessageID) {
    return null;
  }

  const answerMessage = messages.find(
    (message) => message.id === answerMessageID,
  );

  if (!answerMessage) {
    return null;
  }

  return answerMessage;
}

type QAStructuredData = {
  title: string;
  question: string;
  answerMessage: CoreMessageData | null;
  datePublished: Date;
};

function generateQAStructuredData({
  title,
  question,
  answerMessage,
  datePublished,
}: QAStructuredData) {
  let acceptedAnswer: Answer | undefined = undefined;
  if (answerMessage) {
    acceptedAnswer = {
      '@type': 'Answer',
      text: answerMessage.plaintext,
      datePublished: new Date(answerMessage.createdTimestamp).toISOString(),
      dateModified: answerMessage.updatedTimestamp
        ? new Date(answerMessage.updatedTimestamp).toISOString()
        : undefined,
      url: answerMessage.url ?? undefined,
    };
  }
  const content: WithContext<QAPage> = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: question,
      datePublished: new Date(datePublished).toISOString(),
      answerCount: answerMessage ? 1 : 0,
      acceptedAnswer,
    },
  };

  return content;
}
