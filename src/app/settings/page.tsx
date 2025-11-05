import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { PushNotificationManager } from "@/components/notifications/push-notification-manager";

export default function SettingsPage() {
	return (
		<>
			<Navigation />
			<main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
				<div className="space-y-4 sm:space-y-6">
					<div className="flex items-center gap-2 sm:gap-3">
						<span className="text-3xl sm:text-4xl md:text-5xl">🐝</span>
						<div>
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Settings</h1>
							<p className="text-xs sm:text-sm md:text-base text-muted-foreground">Manage your hive preferences</p>
						</div>
					</div>

					<div className="grid gap-4 sm:gap-6">
						{/* Push Notifications - Most Important */}
						<PushNotificationManager />

						{/* Security Settings */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Shield className="h-5 w-5 text-destructive" />
									<CardTitle>Security</CardTitle>
								</div>
								<CardDescription>
									Keep your hive safe and secure
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link href="/account/security">
									<Button variant="outline" className="w-full">
										Change Password
									</Button>
								</Link>
								<Link href="/account/sessions">
									<Button variant="outline" className="w-full">
										Manage Sessions
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</>
	);
}
