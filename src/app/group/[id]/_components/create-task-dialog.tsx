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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateTaskDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	groupId: string;
	taskType: "learning" | "shop";
};

export function CreateTaskDialog({
	open,
	onOpenChange,
	groupId,
	taskType,
}: CreateTaskDialogProps) {
	const [text, setText] = useState("");
	const [description, setDescription] = useState("");
	const [costCoins, setCostCoins] = useState(50);
	const [coins, setCoins] = useState(10);
	const [maxRepetitions, setMaxRepetitions] = useState(5);
	const [intervals, setIntervals] = useState("1,3,6,14,30,66");

	const utils = api.useUtils();

	const createTask = api.task.createTask.useMutation({
		onMutate: async () => {
			// Optimistically close dialog and reset
			onOpenChange(false);
			resetForm();
		},
		onSuccess: () => {
			utils.task.getTodaysTasks.invalidate({ groupId });
			utils.task.getShop.invalidate({ groupId });
		},
	});

	const resetForm = () => {
		setText("");
		setDescription("");
		setCostCoins(50);
		setMaxRepetitions(5);
		setIntervals("1,3,7,14,30");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		const intervalArray = intervals
			.split(",")
			.map((i) => parseInt(i.trim()))
			.filter((i) => !isNaN(i));

		createTask.mutate({
			groupId,
			text: text.trim(),
			description: description.trim() || undefined,
			maxRepetitions,
			intervals: intervalArray,
			costCoins: taskType === "shop" ? costCoins : 0,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{taskType === "learning" ? "📚 Create Learning Task" : "🛒 Create Shop Task"}
						</DialogTitle>
						<DialogDescription>
							{taskType === "learning"
								? "Create a task you want to remember using spaced repetition"
								: "Create a fun task others can buy with coins"}
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="text">Task Title *</Label>
							<Input
								id="text"
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder={
									taskType === "learning"
										? "e.g., Learn bones in the body"
										: "e.g., Come to school in funny costume"
								}
								className="mt-2"
								required
							/>
						</div>

						<div>
							<Label htmlFor="description">Description (optional)</Label>
							<Input
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Add more details..."
								className="mt-2"
							/>
						</div>

						<div>
							<Label htmlFor="maxRepetitions">Max Repetitions</Label>
							<Input
								id="maxRepetitions"
								type="number"
								min="1"
								max="100"
								value={maxRepetitions}
								onChange={(e) => setMaxRepetitions(parseInt(e.target.value))}
								className="mt-2"
								required
							/>
							<p className="text-xs text-muted-foreground mt-1">
								How many times this task will repeat (reward: 10 🍯 per completion)
							</p>
						</div>

						{taskType === "shop" && (
							<div>
								<Label htmlFor="costCoins">Cost (🍯 Coins)</Label>
								<Input
									id="costCoins"
									type="number"
									min="1"
									value={costCoins}
									onChange={(e) => setCostCoins(parseInt(e.target.value))}
									className="mt-2"
									required
								/>
								<p className="text-xs text-muted-foreground mt-1">
									How many coins others need to pay to buy this task
								</p>
							</div>
						)}

						<div>
							<Label htmlFor="intervals">Intervals (days, comma-separated)</Label>
							<Input
								id="intervals"
								value={intervals}
								onChange={(e) => setIntervals(e.target.value)}
								placeholder="1,3,7,14,30"
								className="mt-2"
								required
							/>
							<p className="text-xs text-muted-foreground mt-1">
								When the task will repeat (e.g., 1,3,6,14,30 means after 1 day, then 3 days, etc.)
							</p>
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
						<Button type="submit" disabled={!text.trim() || createTask.isPending}>
							{createTask.isPending ? "Creating..." : "Create Task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
