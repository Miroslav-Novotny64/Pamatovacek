import { AccountView } from "@daveyplate/better-auth-ui"
import { accountViewPaths } from "@daveyplate/better-auth-ui/server"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent } from "@/components/ui/card"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    const titles: Record<string, { title: string; emoji: string }> = {
        "settings": { title: "Account Settings", emoji: "⚙️" },
        "security": { title: "Security", emoji: "🔒" },
        "sessions": { title: "Active Sessions", emoji: "📱" },
        "api-keys": { title: "API Keys", emoji: "🔑" },
        "organizations": { title: "Organizations", emoji: "🏢" },
    }

    const pageInfo = titles[path] || { title: "Account", emoji: "👤" }

    return (
        <>
            <Navigation />
            <main className="container mx-auto p-4 md:p-6 max-w-4xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-5xl">{pageInfo.emoji}</span>
                        <h1 className="text-4xl font-bold">{pageInfo.title}</h1>
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <AccountView path={path} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}