"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Coins } from "lucide-react";

type GroupCardProps = {
	group: {
		id: string;
		name: string;
		myCoins: number;
		memberCount: number;
		createdAt: Date;
	};
};

export function GroupCard({ group }: GroupCardProps) {
	return (
		<Card className="hover:border-primary transition-all hover:shadow-xl hover:scale-105 h-full group cursor-pointer border-2 bg-gradient-to-br from-primary/5 to-transparent">
			<Link href={`/group/${group.id}`} className="block h-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors text-xl">
						<span className="text-3xl group-hover:scale-110 transition-transform">🐝</span>
						{group.name}
					</CardTitle>
					<CardDescription className="flex items-center gap-1">
						<span>📅</span>
						{new Date(group.createdAt).toLocaleDateString()}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
						<div className="flex items-center gap-2 font-medium">
							<Users className="h-4 w-4 text-secondary" />
							<span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>
						</div>
						<div className="flex items-center gap-2 font-bold text-primary">
							<Coins className="h-5 w-5" />
							<span className="text-lg">{group.myCoins} 🍯</span>
						</div>
					</div>
					<div className="pt-2 border-t border-primary/20">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground group-hover:text-primary transition-colors font-medium">
								View tasks
							</span>
							<span className="text-primary group-hover:translate-x-1 transition-transform">
								→
							</span>
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	);
}
