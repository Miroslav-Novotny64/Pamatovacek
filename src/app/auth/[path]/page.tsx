import { AuthView } from "@daveyplate/better-auth-ui"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="relative">
                            <span className="text-5xl animate-bounce">🐝</span>
                            <span className="absolute -top-1 -right-1 text-2xl">🍯</span>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            Pamatováček
                        </h1>
                    </div>
                    <p className="text-muted-foreground">Your bee-utiful task manager 🌸</p>
                </div>
                <div className="backdrop-blur-sm bg-card/50 rounded-lg border-2 border-primary/20 shadow-xl p-6">
                    <AuthView path={path} />
                </div>
                <div className="mt-6 text-center">
                    <div className="flex gap-3 justify-center text-2xl opacity-60">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🌼</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>🌸</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🌻</span>
                    </div>
                </div>
            </div>
        </main>
    )
}