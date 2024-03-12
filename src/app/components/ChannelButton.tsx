import cx from "classnames";
import styles from "./channelButton.module.css";
import {
  SpeakerWaveIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export type Channel = {
  id: string;
  group: string | null;
};

function ChannelButtonIcon({ channelName }: { channelName: string }) {
  switch (channelName) {
    case "announcements":
      return <SpeakerWaveIcon width={"16px"} />;
    case "chat":
      return <ChatBubbleLeftRightIcon width={"16px"} />;
    default:
      return <HashtagIcon width={"16px"} />;
  }
}

export function ChannelButton({
  channel,
  linkTo,
  isActive,
}: {
  channel: Channel;
  linkTo: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={linkTo}
      className={cx(styles.channelButton, {
        [styles.channelButtonActive]: isActive,
      })}
    >
      <ChannelButtonIcon channelName={channel.id} />
      <span className={styles.channelName}>{channel.id}</span>
    </Link>
  );
}
