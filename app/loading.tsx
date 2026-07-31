import { Mark } from "@/components/Brand";

/**
 * Shown while a route segment streams in. Next renders this automatically,
 * so it is also what a player on a slow MiniPay connection stares at — it
 * should set the mood rather than apologise for the wait.
 */
export default function Loading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-lamp">
        <Mark size={64} />
      </div>
      <p className="label">Unlocking the room</p>
      <div className="loading-bar">
        <span />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
