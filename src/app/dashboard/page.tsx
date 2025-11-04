import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Navigation } from "@/components/layout/navigation";
import { DashboardContent } from "@/app/dashboard/_components/dashboard-content";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth/sign-in");
	}

	return (
		<>
			<Navigation />
			<DashboardContent />
		</>
	);
}
