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
import { useRouter } from "next/navigation";

type CreateGroupDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
	const [name, setName] = useState("");
	const router = useRouter();
	const utils = api.useUtils();

	const createGroup = api.group.create.useMutation({
		onMutate: async () => {
			onOpenChange(false);
			setName("");
		},
		onSuccess: async (group) => {
			await utils.group.getMyGroups.invalidate();
			router.push(`/group/${group.id}`);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			createGroup.mutate({ name: name.trim() });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create a new group 🐝</DialogTitle>
						<DialogDescription>
							Start a new hive to manage tasks with your friends!
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label htmlFor="name">Group Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Study Group, Gym Buddies..."
							className="mt-2"
							autoFocus
						/>
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
							type="submit"
							disabled={!name.trim() || createGroup.isPending}
						>
							{createGroup.isPending ? "Creating..." : "Create Group"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
