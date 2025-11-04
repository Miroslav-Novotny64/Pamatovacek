import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Navigation } from "@/components/layout/navigation";
import { GroupContent } from "./_components/group-content";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth/sign-in");
	}

	const { id } = await params;

	return (
		<>
			<Navigation />
			<GroupContent groupId={id} />
		</>
	);
}
