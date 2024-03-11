import ChannelList from "../components/ChannelList";
import Header from "../components/Header";

export default function Layout({children}: {
  children: React.ReactNode;
}) {
  return <div>
    <ChannelList />
    <Header />
    {children}
  </div>
}