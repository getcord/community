import ThreadList from "../components/ThreadList";

export default function Content({ params }: { params?: { category: string } }) {
  const category = params ? params.category : "all";
  return <ThreadList category={category} />;
}
