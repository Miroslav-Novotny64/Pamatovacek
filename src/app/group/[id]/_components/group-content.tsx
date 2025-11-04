"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TodaysTasks } from "./todays-tasks";
import { ShopTasks } from "./shop-tasks";
import { CreateTaskDialog } from "./create-task-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type GroupContentProps = {
	groupId: string;
};

export function GroupContent({ groupId }: GroupContentProps) {
	const [showCreateTask, setShowCreateTask] = useState(false);
	const [showInvite, setShowInvite] = useState(false);
	const [taskType, setTaskType] = useState<"learning" | "shop">("learning");
	const { data: group, isLoading } = api.group.getGroupDetails.useQuery({ groupId });

	if (isLoading) {
		return (
			<main className="container mx-auto px-4 py-8">
				<Skeleton className="h-12 w-64 mb-8" />
				<Skeleton className="h-96 w-full" />
			</main>
		);
	}

	if (!group) {
		return (
			<main className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Group not found</h1>
					<Link href="/dashboard">
						<Button>Back to Dashboard</Button>
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="container mx-auto px-4 py-6 md:py-8">
			<div className="flex items-start gap-2 md:gap-4 mb-6 md:mb-8">
				<Link href="/dashboard">
					<Button variant="ghost" size="icon" className="mt-1">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<div className="flex-1">
					<h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2 break-words">
						🐝 {group.name}
					</h1>
					<p className="text-sm md:text-base text-muted-foreground mt-1">
						You have <span className="font-bold text-primary">{group.myCoins} 🍯</span> honey coins • {group.members.length} members
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowInvite(true)}
				>
					Invite
				</Button>
			</div>

			<Tabs defaultValue="today" className="space-y-4 md:space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="today" className="text-xs sm:text-sm">📝 Today's Tasks</TabsTrigger>
					<TabsTrigger value="shop" className="text-xs sm:text-sm">🛒 Shop</TabsTrigger>
				</TabsList>

				<TabsContent value="today" className="space-y-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
						<h2 className="text-xl md:text-2xl font-semibold">Tasks for Today</h2>
						<Button
							onClick={() => {
								setTaskType("learning");
								setShowCreateTask(true);
							}}
							size="sm"
							className="w-full sm:w-auto"
						>
							<Plus className="mr-2 h-4 w-4" />
							<span className="hidden sm:inline">Add Learning Task</span>
							<span className="sm:hidden">Add Task</span>
						</Button>
					</div>
					<TodaysTasks groupId={groupId} />
				</TabsContent>

				<TabsContent value="shop" className="space-y-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
						<h2 className="text-xl md:text-2xl font-semibold">Task Shop</h2>
						<Button
							onClick={() => {
								setTaskType("shop");
								setShowCreateTask(true);
							}}
							size="sm"
							className="w-full sm:w-auto"
						>
							<Plus className="mr-2 h-4 w-4" />
							<span className="hidden sm:inline">Add Shop Task</span>
							<span className="sm:hidden">Add Task</span>
						</Button>
					</div>
					<ShopTasks groupId={groupId} userCoins={group.myCoins} />
				</TabsContent>
			</Tabs>

			<CreateTaskDialog
				open={showCreateTask}
				onOpenChange={setShowCreateTask}
				groupId={groupId}
				taskType={taskType}
			/>
			
			<InviteMemberDialog
				open={showInvite}
				onOpenChange={setShowInvite}
				groupId={groupId}
			/>
		</main>
	);
}
