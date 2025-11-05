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
			<div className="container flex h-16 items-center justify-between px-3 sm:px-4">
				<Link href="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
					<div className="relative shrink-0">
						<span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform inline-block">🐝</span>
						<span className="absolute -top-1 -right-1 text-xs">🍯</span>
					</div>
					<div className="flex flex-col min-w-0">
						<span className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight truncate">
							Pamatováček
						</span>
						<span className="text-[9px] sm:text-[10px] text-muted-foreground leading-none hidden xs:block">Your bee-utiful hive 🌸</span>
					</div>
				</Link>

				<div className="flex items-center gap-1 sm:gap-2 shrink-0">
					{isPending ? (
						<div className="h-10 w-20 sm:w-32 animate-pulse bg-muted rounded" />
					) : session?.user ? (
						<>
							<div className="hidden md:flex items-center gap-2 text-sm mr-2 max-w-[150px] lg:max-w-none">
								<span className="text-muted-foreground hidden lg:inline">Bzz bzz,</span>
								<span className="font-medium truncate">{session.user.name || session.user.email}</span>
								<span>🐝</span>
							</div>
							<Link href="/settings" className="shrink-0">
								<Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
									<Settings className="h-4 w-4 sm:h-5 sm:w-5" />
								</Button>
							</Link>
							<ThemeToggle />
							<Link href="/api/auth/sign-out" className="shrink-0">
								<Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
									<LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
								</Button>
							</Link>
						</>
					) : (
						<>
							<ThemeToggle />
							<Link href="/auth/sign-in" className="shrink-0">
								<Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">Sign In</Button>
							</Link>
							<Link href="/auth/sign-up" className="shrink-0">
								<Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3">Sign Up</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
