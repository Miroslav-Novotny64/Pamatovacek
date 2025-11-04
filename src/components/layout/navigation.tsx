"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
	const { data: session, isPending } = useSession();

	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
			<div className="container flex h-16 items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 group">
					<div className="relative">
						<span className="text-3xl group-hover:scale-110 transition-transform inline-block">🐝</span>
						<span className="absolute -top-1 -right-1 text-xs">🍯</span>
					</div>
					<div className="flex flex-col">
						<span className="font-bold text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
							Pamatováček
						</span>
						<span className="text-[10px] text-muted-foreground leading-none">Your bee-utiful hive 🌸</span>
					</div>
				</Link>

				<div className="flex items-center gap-2">
					{isPending ? (
						<div className="h-10 w-32 animate-pulse bg-muted rounded" />
					) : session?.user ? (
						<>
							<div className="hidden sm:flex items-center gap-2 text-sm mr-2">
								<span className="text-muted-foreground">Bzz bzz,</span>
								<span className="font-medium">{session.user.name || session.user.email}</span>
								<span>🐝</span>
							</div>
							<Link href="/settings">
								<Button variant="ghost" size="icon">
									<Settings className="h-5 w-5" />
								</Button>
							</Link>
							<ThemeToggle />
							<Link href="/api/auth/sign-out">
								<Button variant="ghost" size="icon">
									<LogOut className="h-5 w-5" />
								</Button>
							</Link>
						</>
					) : (
						<>
							<ThemeToggle />
							<Link href="/auth/sign-in">
								<Button variant="ghost" size="sm">Sign In</Button>
							</Link>
							<Link href="/auth/sign-up">
								<Button size="sm">Sign Up</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
