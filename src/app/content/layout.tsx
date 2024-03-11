import ChannelList from "../channelList/page";
import Header from "../header/page";

export default function Layout({children}: {
  children: React.ReactNode;
}) {
  return <div>
    <ChannelList />
    <Header />
    {children}
  </div>
}