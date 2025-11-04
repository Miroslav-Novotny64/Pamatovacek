"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CreateGroupDialog } from "./create-group-dialog";
import { GroupCard } from "./group-card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
	const [showCreateGroup, setShowCreateGroup] = useState(false);
	const { data: groups, isLoading } = api.group.getMyGroups.useQuery();

	return (
		<main className="container mx-auto px-4 py-6 md:py-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
				<div>
					<h1 className="text-3xl md:text-4xl font-bold mb-2">
						Your Hives 🍯
					</h1>
					<p className="text-sm md:text-base text-muted-foreground">
						Manage your groups and collect honey coins!
					</p>
				</div>
				<Button onClick={() => setShowCreateGroup(true)} size="lg" className="w-full sm:w-auto">
					<Plus className="mr-2 h-5 w-5" />
					Create Group
				</Button>
			</div>

			{isLoading ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-3/4 mb-2" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-10 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : groups && groups.length > 0 ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{groups.map((group) => (
						<GroupCard key={group.id} group={group} />
					))}
				</div>
			) : (
				<Card className="border-dashed">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 text-6xl">🐝</div>
						<CardTitle>No groups yet</CardTitle>
						<CardDescription>
							Create your first group to start managing tasks with friends!
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button onClick={() => setShowCreateGroup(true)}>
							<Users className="mr-2 h-4 w-4" />
							Create Your First Group
						</Button>
					</CardContent>
				</Card>
			)}

			<CreateGroupDialog
				open={showCreateGroup}
				onOpenChange={setShowCreateGroup}
			/>
		</main>
	);
}
