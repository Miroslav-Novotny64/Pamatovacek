"use client";

import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";

type TodaysTasksProps = {
	groupId: string;
};

export function TodaysTasks({ groupId }: TodaysTasksProps) {
	const { data: tasks, isLoading } = api.task.getTodaysTasks.useQuery({ groupId });
	const utils = api.useUtils();

	const completeTask = api.task.completeTask.useMutation({
		onMutate: async () => {
			// Show animation immediately
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ['#FFD700', '#FDB931', '#FFA500'],
			});
		},
		onSuccess: (data) => {
			utils.task.getTodaysTasks.invalidate({ groupId });
			utils.group.getGroupDetails.invalidate({ groupId });
		},
	});

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<div className="text-6xl mb-4 animate-bounce">🐝</div>
				<p className="text-muted-foreground">Buzzing through your tasks...</p>
			</div>
		);
	}

	if (!tasks || tasks.length === 0) {
		return (
			<Card className="border-dashed border-2 bg-gradient-to-br from-accent/10 to-transparent">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<div className="text-8xl mb-4 animate-bounce">🎉</div>
					<h3 className="text-2xl font-bold mb-2 text-accent">All done for today!</h3>
					<p className="text-muted-foreground text-center max-w-sm">
						No tasks to complete. You're doing amazing! Keep up the great work! 🐝✨
					</p>
					<div className="flex gap-2 mt-4 text-3xl">
						<span className="animate-bounce" style={{ animationDelay: '0ms' }}>🌸</span>
						<span className="animate-bounce" style={{ animationDelay: '150ms' }}>🍯</span>
						<span className="animate-bounce" style={{ animationDelay: '300ms' }}>🌼</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{tasks.map((userTask) => {
				const isShop = userTask.isFromShop;
				
				return (
					<Card
						key={userTask.id}
						className={`transition-all hover:shadow-lg hover:scale-[1.02] ${
							isShop 
								? "border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 to-secondary/5" 
								: "border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-accent/5"
						}`}
					>
						<CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6">
							<div className="flex-1 w-full">
								<div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
									<Badge 
										variant={isShop ? "secondary" : "default"} 
										className="text-xs font-bold"
									>
										{userTask.timesShown + 1}x
									</Badge>
									<h3 className="text-base md:text-lg font-bold break-words flex items-center gap-2">
										<span className="text-2xl">{isShop ? "🛒" : "📚"}</span>
										{userTask.task.text}
									</h3>
								</div>
								{userTask.task.description && (
									<p className="text-sm text-muted-foreground ml-8">
										{userTask.task.description}
									</p>
								)}
								<div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground ml-8">
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										<span>Due by 4:00 AM</span>
									</div>
									<div className="flex items-center gap-1 font-semibold text-primary">
										<span>Reward: 10 🍯</span>
									</div>
								</div>
							</div>
							<Button
								size="default"
								onClick={() => completeTask.mutate({ userTaskId: userTask.id })}
								disabled={completeTask.isPending}
								className="w-full sm:w-auto shadow-md hover:shadow-lg"
							>
								<CheckCircle2 className="mr-2 h-4 w-4" />
								Complete
							</Button>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
