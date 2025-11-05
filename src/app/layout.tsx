import "@/styles/globals.css";

import type {Metadata} from "next";
import {Geist} from "next/font/google";

import {TRPCReactProvider} from "@/trpc/react";
import {Providers} from "@/app/providers";

export const metadata: Metadata = {
    title: "Pamatováček 🐝 - Your Bee-utiful Task Manager",
    description: "A sweet task management app with cute bees",
    icons: [{rel: "icon", url: "/favicon.ico"}],
    manifest: "/manifest.json",
    themeColor: "#FFD54F",
    appleWebApp: true,
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <head>
                <link rel="manifest" href="/manifest.json"/>
                <meta name="theme-color" content="#FFD54F"/>
                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
                <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <title></title>
            </head>
            <html lang="en" className={`${geist.variable}`}>
            <body className="antialiased min-h-screen overflow-x-hidden touch-manipulation">
            <TRPCReactProvider>
                <Providers>{children}</Providers>
            </TRPCReactProvider>
            </body>
            </html>
        </>
    );
}
