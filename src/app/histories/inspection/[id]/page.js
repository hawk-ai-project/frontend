import LiveInspectionHistoryDetail from "@/components/history/LiveInspectionHistoryDetail";

export default async function InspectionHistoryPage({ params }) {
  const { id } = await params;
  return <LiveInspectionHistoryDetail inspectionId={id} />;
}
