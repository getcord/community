import ChannelDisplay from "./[category]/page";

export default function Content() {
  return (
    <div>
      <ChannelDisplay params={{ category: "code-of-conduct" }} />
      {/* will be dynamic for which category it is -> need to think this through, will there be a map? 🤔 */}
      {/* // redirect to main channe eg chat */}
    </div>
  );
}
