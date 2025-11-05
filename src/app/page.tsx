import Link from "next/link";
import { HydrateClient } from "@/trpc/server";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return (
		<HydrateClient>
			<Navigation />
			<main className="container mx-auto px-4 py-12">
				<div className="flex flex-col items-center justify-center gap-12 min-h-[calc(100vh-8rem)]">
					{/* Hero Section */}
					<div className="text-center space-y-4">
						<div className="flex items-center justify-center gap-3 mb-4">
							<span className="text-6xl animate-bounce">🐝</span>
							<h1 className="font-extrabold text-5xl sm:text-7xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
								Pamatováček
							</h1>
							<span className="text-6xl animate-bounce delay-150">🍯</span>
						</div>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Your bee-utiful task manager! 🌸 Sweet reminders with cute animal friends
						</p>
					</div>

					{/* Feature Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<div className="text-4xl mb-2">🐝</div>
								<CardTitle>Bee Organized</CardTitle>
								<CardDescription>
									Create tasks and let our busy bees remind you at the perfect time
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-secondary transition-colors">
							<CardHeader>
								<div className="text-4xl mb-2">🦋</div>
								<CardTitle>Group Hives</CardTitle>
								<CardDescription>
									Work together with your friends in shared task groups
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-accent transition-colors">
							<CardHeader>
								<div className="text-4xl mb-2">🐛</div>
								<CardTitle>Earn Honey Coins</CardTitle>
								<CardDescription>
									Complete tasks to collect sweet rewards and unlock features
								</CardDescription>
							</CardHeader>
						</Card>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 items-center">
						<Link href="/auth/sign-up">
							<Button size="lg" className="text-lg">
								🌸 Get Started - It's Free!
							</Button>
						</Link>
						<Link href="/auth/sign-in">
							<Button size="lg" variant="outline" className="text-lg">
								🐝 Sign In
							</Button>
						</Link>
					</div>

					{/* Bottom decorative elements */}
					<div className="flex gap-4 text-4xl opacity-50">
						<span>🌼</span>
						<span>🌸</span>
						<span>🌻</span>
						<span>🌺</span>
						<span>🌷</span>
					</div>
				</div>
			</main>
		</HydrateClient>
	);
}
