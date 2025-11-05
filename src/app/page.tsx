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
			<main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-full overflow-x-hidden">
				<div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-12 min-h-[calc(100vh-8rem)]">
					{/* Hero Section */}
					<div className="text-center space-y-2.5 sm:space-y-3 md:space-y-4 w-full">
						<div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4 flex-wrap">
							<span className="text-3xl sm:text-4xl md:text-6xl animate-bounce">🐝</span>
							<h1 className="font-extrabold text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent break-words max-w-full">
								Pamatováček
							</h1>
							<span className="text-3xl sm:text-4xl md:text-6xl animate-bounce delay-150">🍯</span>
						</div>
						<p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4">
							Your bee-utiful task manager! 🌸 Sweet reminders with cute animal friends
						</p>
					</div>

					{/* Feature Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-5xl">
						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader className="p-3 sm:p-4 md:p-6">
								<div className="text-2xl sm:text-3xl md:text-4xl mb-1.5 sm:mb-2">🐝</div>
								<CardTitle className="text-base sm:text-lg md:text-xl">Bee Organized</CardTitle>
								<CardDescription className="text-xs sm:text-sm md:text-base">
									Create tasks and let our busy bees remind you at the perfect time
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-secondary transition-colors">
							<CardHeader className="p-3 sm:p-4 md:p-6">
								<div className="text-2xl sm:text-3xl md:text-4xl mb-1.5 sm:mb-2">🦋</div>
								<CardTitle className="text-base sm:text-lg md:text-xl">Group Hives</CardTitle>
								<CardDescription className="text-xs sm:text-sm md:text-base">
									Work together with your friends in shared task groups
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-accent transition-colors">
							<CardHeader className="p-3 sm:p-4 md:p-6">
								<div className="text-2xl sm:text-3xl md:text-4xl mb-1.5 sm:mb-2">🐛</div>
								<CardTitle className="text-base sm:text-lg md:text-xl">Earn Honey Coins</CardTitle>
								<CardDescription className="text-xs sm:text-sm md:text-base">
									Complete tasks to collect sweet rewards and unlock features
								</CardDescription>
							</CardHeader>
						</Card>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 items-stretch sm:items-center w-full sm:w-auto px-2 sm:px-4 md:px-0">
						<Link href="/auth/sign-up" className="w-full sm:w-auto">
							<Button size="lg" className="text-sm sm:text-base md:text-lg w-full px-6 sm:px-8">
								🌸 Get Started - It's Free!
							</Button>
						</Link>
						<Link href="/auth/sign-in" className="w-full sm:w-auto">
							<Button size="lg" variant="outline" className="text-sm sm:text-base md:text-lg w-full px-6 sm:px-8">
								🐝 Sign In
							</Button>
						</Link>
					</div>

					{/* Bottom decorative elements */}
					<div className="flex gap-2 sm:gap-3 md:gap-4 text-2xl sm:text-3xl md:text-4xl opacity-50">
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
