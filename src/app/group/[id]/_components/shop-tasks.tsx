"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coins, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { BuyTaskDialog } from "./buy-task-dialog";

type ShopTasksProps = {
	groupId: string;
	userCoins: number;
};

export function ShopTasks({ groupId, userCoins }: ShopTasksProps) {
	const [selectedTask, setSelectedTask] = useState<string | null>(null);
	const { data: shopTasks, isLoading } = api.task.getShop.useQuery({ groupId });

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<div className="text-6xl mb-4 animate-bounce">🛍️</div>
				<p className="text-muted-foreground">Opening the honey shop...</p>
			</div>
		);
	}

	if (!shopTasks || shopTasks.length === 0) {
		return (
			<Card className="border-dashed border-2 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-3 sm:px-4">
					<div className="text-5xl sm:text-6xl md:text-8xl mb-3 sm:mb-4">🛍️</div>
					<h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-primary">Shop is empty!</h3>
					<p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-3 sm:mb-4">
						Create fun tasks or challenges that others can buy with coins and assign to group members! 
					</p>
					<div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 sm:p-4 max-w-md w-full">
						<p className="font-semibold mb-2">💡 Ideas for shop tasks:</p>
						<ul className="space-y-1 text-xs">
							<li>• "Wear a funny costume to school"</li>
							<li>• "Make me a sandwich"</li>
							<li>• "Do 50 pushups"</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
				{shopTasks.map((task) => {
					const canAfford = task.canAfford;
					
					return (
						<Card
							key={task.id}
							className={`transition-all hover:shadow-lg hover:scale-[1.01] ${
								canAfford 
									? "border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5" 
									: "opacity-60 border"
							}`}
						>
							<CardHeader className="p-3 sm:p-4 md:p-6">
								<div className="flex justify-between items-start gap-2">
									<CardTitle className="text-base sm:text-lg font-bold flex items-center gap-1.5 sm:gap-2 min-w-0">
										<span className="text-xl sm:text-2xl shrink-0">🛍️</span>
										<span className="break-words">{task.text}</span>
									</CardTitle>
									<Badge variant={canAfford ? "default" : "secondary"} className="text-xs font-bold shrink-0">
										{task.costCoins} 🍯
									</Badge>
								</div>
								<CardDescription className="flex items-center gap-1 text-xs sm:text-sm truncate">
									<span>👤</span>
									<span className="truncate">{task.creator.name || task.creator.email}</span>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 md:p-6 pt-0">
								{task.description && (
									<p className="text-xs sm:text-sm text-muted-foreground break-words">
										{task.description}
									</p>
								)}
								<div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
									<div className="flex items-center gap-1 text-muted-foreground">
										<span className="font-semibold">Reward:</span>
										<span className="text-primary font-bold">10 🍯</span>
									</div>
									<div className="flex items-center gap-1 text-muted-foreground">
										<span className="font-semibold">Repeats:</span>
										<span>{task.maxRepetitions}x</span>
									</div>
								</div>
								<Button
									className="w-full shadow-md hover:shadow-lg text-xs sm:text-sm"
									size="sm"
									disabled={!canAfford}
									onClick={() => setSelectedTask(task.id)}
								>
									<ShoppingCart className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
									{canAfford ? "Buy Task" : "Not enough coins"}
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{selectedTask && (
				<BuyTaskDialog
					open={!!selectedTask}
					onOpenChange={(open) => !open && setSelectedTask(null)}
					taskId={selectedTask}
					groupId={groupId}
					userCoins={userCoins}
				/>
			)}
		</>
	);
}
