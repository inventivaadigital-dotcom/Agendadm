import AppointmentDetails from "@/components/AppointmentDetails";
export default function P({ params }: { params: { id: string } }) { return <AppointmentDetails id={params.id} />; }
