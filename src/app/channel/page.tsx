import ChannelDisplay from "./[channel]/page";

export default function Content() {
  return (
    <div>
      <ChannelDisplay params={{ channel: "code-of-conduct" }} />
      {/* will be dynamic for which channel it is -> need to think this through, will there be a map? 🤔 */}
      {/* // redirect to main channe eg chat */}
    </div>
  );
}
