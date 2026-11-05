import Form from "@/components/Form"; export default function P({ params }: { params: { id: string } }) { return <Form id={params.id} />; }
