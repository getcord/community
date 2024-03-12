import styles from "./channelList.module.css";
import type { ServerGetUser, ServerUserData } from "@cord-sdk/types";
import { EVERYONE_ORG_ID, USERS } from "@/consts";
import { fetchCordRESTApi } from "@/app/fetchCordRESTApi";
import { ChannelButton } from "@/app/components/ChannelButton";

export type Channel = {
  id: string;
  group: string | null;
};

async function getAllChannels() {
  // TODO: update this to use logged in user id
  // TODO: update this to use myhoa or tom if you'd like to test admin users experience
  const user_id = USERS[0].user_id;

  try {
    const { groups } = await fetchCordRESTApi<ServerGetUser>(
      `users/${user_id}`
    );

    const mostChannels = (
      await fetchCordRESTApi<ServerUserData>("users/all_channels_holder")
    ).metadata as Record<string, string>;

    const availableChannels = Object.entries(mostChannels)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce(
        (acc, [key, value]) => {
          if (groups.includes(value)) {
            acc[key] = value;
          }
          return acc;
        },
        // Special channel: everyone starts with general in their list
        { "code-of-conduct": EVERYONE_ORG_ID } as Record<string, string | null>
      );
    return availableChannels;
  } catch (error) {
    console.error(error);
  }
}

export default async function ChannelList() {
  const channels = await getAllChannels();

  if (!channels) {
    return <div>NO CHANNELS</div>;
  }
  const allChannelsArray = Object.entries(channels).reduce(
    (acc, [key, value]) => {
      acc.push({ id: key, group: value });
      return acc;
    },
    [] as Channel[]
  );
  // TODO: styling and functionality
  return (
    <div className={styles.container}>
      <div>ALL CHANNELS LIST:</div>
      <ul>
        {allChannelsArray.map((channel) => {
          return (
            <ChannelButton
              key={channel.id}
              isActive={false}
              channel={channel}
              linkTo={`/channel/${channel.id}`}
            />
          );
        })}
      </ul>
    </div>
  );
}
