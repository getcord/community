import styles from "./chatDisplay.module.css";
import { ServerListMessages } from "@cord-sdk/types";
import { fetchCordRESTApi } from "@/app/fetchCordRESTApi";
import CordMessage from "./CordMessage";
import ThreadsHeader from "@/app/category/[category]/ThreadsHeader";
import { CORD_USER_COOKIE } from "@/consts";
import type { ServerUserData, ServerGetUser } from "@cord-sdk/types";
import { cookies } from "next/headers";
const getData = async () => {
  const messages = await fetchCordRESTApi<ServerListMessages["messages"]>(
    `threads/cord:e0b0d30d-926e-4b66-82b6-d6d7f8cc7809/messages`,
    "GET"
  );
  return messages;
};

// TODO: move this into a permissions context
async function getAllCategoriesPermissions() {
  // TODO: update this to use logged in user id
  // change this to use myhoa or tom if you'd like to test admin users experience
  const user_id = "khadija";

  try {
    // Fetch all groups the current user is in
    const { groups } = await fetchCordRESTApi<ServerGetUser>(
      `users/${user_id}`
    );

    const mostCategories = (
      await fetchCordRESTApi<ServerUserData>("users/all_categories_holder")
    ).metadata as Record<string, string>;

    // returns all categories, with their permissions
    return Object.entries(mostCategories)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [key, value]) => {
        if (groups.includes(value)) {
          acc[key] = { permission: "READ_WRITE", group: value };
        } else {
          acc[key] = { permission: "READ", group: value };
        }
        return acc;
      }, {} as Record<string, { permission: string; group: string }>);
  } catch (error) {
    console.error(error);
  }
}

export default async function ChatDisplay({
  channelName,
}: {
  channelName: string;
}) {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);
  const messages = await getData();
  const permissions = await getAllCategoriesPermissions();
  function getPermissionForChannel() {
    if (!userIdCookie || !permissions || !permissions[channelName]) {
      return "NOT_VISIBLE";
    }
    return permissions[channelName].permission;
  }

  return (
    <div className={styles.container}>
      <ThreadsHeader permissions={getPermissionForChannel()} />
      <div className={styles.threads}>
        {messages?.length > 0 &&
          messages.map((message) => {
            return <CordMessage key={message.id} message={message} />;
          })}
      </div>
      {/* pull this out into content & have a map of which channels have what kind of composer permissions? */}
      {/* <Composer
        type="NO_PERMISSION"
        groupId={EVERYONE_GROUP_ID}
        location={{ channel: "announcements" }}
        threadName={`#announcements`}
      /> */}
    </div>
  );
}
