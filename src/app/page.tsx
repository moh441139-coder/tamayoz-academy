import { HomeClient } from "./HomeClient";
import { getPublicState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const state = await getPublicState();
  return <HomeClient initial={state} />;
}
