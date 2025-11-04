"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const subscribe = api.push.subscribe.useMutation();
	const unsubscribe = api.push.unsubscribe.useMutation();
	const sendTest = api.push.sendTestNotification.useMutation();

	useEffect(() => {
		setIsSupported(
			typeof window !== 'undefined' &&
			'serviceWorker' in navigator &&
			'PushManager' in window &&
			'Notification' in window
		);
		checkSubscription();
	}, []);

	async function checkSubscription() {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			setIsSubscribed(!!subscription);
		} catch (error) {
			console.error('Error checking subscription:', error);
		}
	}

	async function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	async function subscribeToPush() {
		setIsLoading(true);
		try {
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				alert('Please enable notifications to receive task reminders! 🐝');
				setIsLoading(false);
				return;
			}

			const registration = await navigator.serviceWorker.register('/sw.js');
			await navigator.serviceWorker.ready;

			const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
			if (!vapidPublicKey) {
				alert('Notifications not configured. Please contact support.');
				setIsLoading(false);
				return;
			}

			const applicationServerKey = await urlBase64ToUint8Array(vapidPublicKey);
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			});

			const subscriptionJSON = subscription.toJSON();
			await subscribe.mutateAsync({
				endpoint: subscription.endpoint,
				p256dh: subscriptionJSON.keys?.p256dh || '',
				auth: subscriptionJSON.keys?.auth || '',
			});

			setIsSubscribed(true);
			alert('🎉 Notifications enabled! You\'ll receive task reminders at 8 AM every day.');
		} catch (error) {
			console.error('Error subscribing to push:', error);
			alert('Failed to enable notifications. Please try again.');
		}
		setIsLoading(false);
	}

	async function unsubscribeFromPush() {
		setIsLoading(true);
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				await subscription.unsubscribe();
				await unsubscribe.mutateAsync({ endpoint: subscription.endpoint });
			}

			setIsSubscribed(false);
			alert('Notifications disabled.');
		} catch (error) {
			console.error('Error unsubscribing:', error);
			alert('Failed to disable notifications. Please try again.');
		}
		setIsLoading(false);
	}

	async function testNotification() {
		try {
			await sendTest.mutateAsync();
			alert('✅ Test notification sent! Check your device.');
		} catch (error) {
			alert('Failed to send test notification. Make sure you\'ve enabled notifications first!');
		}
	}

	if (!isSupported) {
		return (
			<Card className="border-muted">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BellOff className="h-5 w-5" />
						Notifications Not Supported
					</CardTitle>
					<CardDescription>
						Your browser doesn't support push notifications.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Daily Task Notifications
				</CardTitle>
				<CardDescription>
					Get reminded about your tasks every morning at 8 AM 🌅
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-3">
					{!isSubscribed ? (
						<>
							<Button
								onClick={subscribeToPush}
								disabled={isLoading}
								className="w-full"
								size="lg"
							>
								<Bell className="mr-2 h-5 w-5" />
								{isLoading ? 'Enabling...' : 'Enable Notifications 🐝'}
							</Button>
							<p className="text-xs text-muted-foreground text-center">
								You'll receive a separate notification for each task due today
							</p>
						</>
					) : (
						<>
							<div className="flex items-center justify-center gap-2 p-4 bg-accent/10 rounded-lg border border-accent/20">
								<span className="text-3xl">✅</span>
								<span className="font-bold text-accent text-lg">Notifications Enabled!</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<Button
									onClick={testNotification}
									disabled={sendTest.isPending}
									variant="outline"
								>
									{sendTest.isPending ? 'Sending...' : '🧪 Test'}
								</Button>
								<Button
									onClick={unsubscribeFromPush}
									disabled={isLoading}
									variant="destructive"
								>
									<BellOff className="mr-2 h-4 w-4" />
									Disable
								</Button>
							</div>
						</>
					)}
				</div>

				<div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
					<p className="font-semibold flex items-center gap-2">
						<span>📱</span> How it works:
					</p>
					<ul className="space-y-1 ml-6 list-disc">
						<li>Every task gets its own notification</li>
						<li>Sent at 8:00 AM your local time</li>
						<li>Works even when the app is closed</li>
						<li>Available on iOS (16.4+), Android, and Desktop</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
