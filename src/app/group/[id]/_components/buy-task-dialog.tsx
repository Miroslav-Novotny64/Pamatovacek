"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type BuyTaskDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	taskId: string;
	groupId: string;
	userCoins: number;
};

export function BuyTaskDialog({
	open,
	onOpenChange,
	taskId,
	groupId,
	userCoins,
}: BuyTaskDialogProps) {
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const utils = api.useUtils();

	const { data: group } = api.group.getGroupDetails.useQuery({ groupId });
	const { data: shopTasks } = api.task.getShop.useQuery({ groupId });

	const task = shopTasks?.find((t) => t.id === taskId);

	const buyTask = api.task.buyTask.useMutation({
		onMutate: async () => {
			onOpenChange(false);
			setSelectedUserId("");
		},
		onSuccess: () => {
			utils.task.getTodaysTasks.invalidate({ groupId });
			utils.task.getShop.invalidate({ groupId });
			utils.group.getGroupDetails.invalidate({ groupId });
		},
	});

	const handleBuy = () => {
		if (selectedUserId) {
			buyTask.mutate({
				taskId,
				groupId,
				assignToUserId: selectedUserId,
			});
		}
	};

	if (!task || !group) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Buy Task: {task.text}</DialogTitle>
					<DialogDescription>
						Assign this task to a group member. They'll need to complete it!
					</DialogDescription>
				</DialogHeader>
				
				<div className="space-y-4 py-4">
					<div className="flex justify-between items-center p-3 bg-muted rounded-lg">
						<span className="font-medium">Cost:</span>
						<span className="text-lg font-bold text-primary">
							{task.costCoins} 🍯
						</span>
					</div>

					<div className="flex justify-between items-center p-3 bg-muted rounded-lg">
						<span className="font-medium">Your coins:</span>
						<span className="text-lg font-bold">
							{userCoins} 🍯
						</span>
					</div>

					<div>
						<Label htmlFor="member">Assign to:</Label>
						<select
							id="member"
							className="w-full mt-2 p-2 border rounded-md"
							value={selectedUserId}
							onChange={(e) => setSelectedUserId(e.target.value)}
						>
							<option value="">Select a member...</option>
							{group.members.map((member) => (
								<option key={member.user.id} value={member.user.id}>
									{member.user.name || member.user.email}
								</option>
							))}
						</select>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleBuy}
						disabled={!selectedUserId || buyTask.isPending || userCoins < task.costCoins}
					>
						{buyTask.isPending ? "Buying..." : `Buy for ${task.costCoins} 🍯`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
