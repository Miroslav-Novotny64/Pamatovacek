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
import { UserPlus } from "lucide-react";

type InviteMemberDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	groupId: string;
};

export function InviteMemberDialog({
	open,
	onOpenChange,
	groupId,
}: InviteMemberDialogProps) {
	const [email, setEmail] = useState("");
	const utils = api.useUtils();

	const inviteMember = api.group.inviteMember.useMutation({
		onMutate: async () => {
			onOpenChange(false);
			setEmail("");
		},
		onSuccess: () => {
			utils.group.getGroupDetails.invalidate({ groupId });
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (email.trim()) {
			inviteMember.mutate({
				groupId,
				email: email.trim(),
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserPlus className="h-5 w-5" />
							Invite Member to Hive
						</DialogTitle>
						<DialogDescription>
							Invite someone to join your group by their email address
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="friend@example.com"
							className="mt-2"
							autoFocus
							required
						/>
						<p className="text-xs text-muted-foreground mt-2">
							They must already have an account to join
						</p>
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
							disabled={!email.trim() || inviteMember.isPending}
						>
							{inviteMember.isPending ? "Inviting..." : "Send Invite"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
