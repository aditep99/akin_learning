import { ConfirmDialog } from "./ConfirmDialog";

const destinationLabels = {
  today: "Today",
  worlds: "Worlds",
  arcade: "Arcade",
  rewards: "Rewards",
};

export function NavigationLeaveDialog({
  destination = "",
  onCancel,
  onConfirm,
}) {
  if (!destination) {
    return null;
  }

  return (
    <ConfirmDialog
      cancelLabel="Keep Playing"
      confirmLabel="Leave Mission"
      description={`Your progress is saved. You can resume this mission later. Go to ${destinationLabels[destination] || "another page"}?`}
      id="navigation-leave-dialog"
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Leave this mission?"
      tone="warning"
    />
  );
}
