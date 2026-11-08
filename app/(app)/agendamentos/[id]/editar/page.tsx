import Form from "@/components/Form";
export default function Editar({ params }: { params: { id: string } }) { return <Form id={params.id} />; }
