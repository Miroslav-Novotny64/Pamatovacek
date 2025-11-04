/**
 * Color System Demo Component
 * This component demonstrates how to use the color variables with Tailwind classes
 */

export function ColorDemo() {
	return (
		<div className="space-y-4 p-8">
			<h1 className="text-3xl font-bold text-foreground">Color System Demo</h1>
			
			{/* Primary Color */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Primary (Honey Yellow)</h2>
				<div className="bg-primary text-primary-foreground p-4 rounded-lg">
					Primary background with primary-foreground text
				</div>
			</div>

			{/* Secondary Color */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Secondary (Lavender Purple)</h2>
				<div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
					Secondary background with secondary-foreground text
				</div>
			</div>

			{/* Accent Color */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Accent (Sage Green)</h2>
				<div className="bg-accent text-accent-foreground p-4 rounded-lg">
					Accent background with accent-foreground text
				</div>
			</div>

			{/* Muted Color */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Muted (Peach Orange)</h2>
				<div className="bg-muted text-muted-foreground p-4 rounded-lg">
					Muted background with muted-foreground text
				</div>
			</div>

			{/* Destructive Color */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Destructive (Soft Red)</h2>
				<div className="bg-destructive text-destructive-foreground p-4 rounded-lg">
					Destructive background with destructive-foreground text
				</div>
			</div>

			{/* Card */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Card</h2>
				<div className="bg-card text-card-foreground p-4 rounded-lg border border-border">
					Card background with border
				</div>
			</div>

			{/* Text Colors */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Text Colors</h2>
				<div className="space-y-1 bg-card p-4 rounded-lg">
					<p className="text-primary">Primary text color</p>
					<p className="text-secondary">Secondary text color</p>
					<p className="text-accent">Accent text color</p>
					<p className="text-muted-foreground">Muted text color</p>
					<p className="text-destructive">Destructive text color</p>
				</div>
			</div>
		</div>
	);
}
