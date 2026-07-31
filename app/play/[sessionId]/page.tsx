import RoomClient from "./RoomClient";

export default async function Play({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <RoomClient mode={sessionId === "ranked" ? "ranked" : "practice"} />;
}
