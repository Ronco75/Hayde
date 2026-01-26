import { useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

const pageTitles: Record<string, string> = {
    "/": "דשבורד",
    "/dashboard": "דשבורד",
    "/categories": "קטגוריות",
    "/expenses": "הוצאות",
    "/guests": "אורחים",
    "/settings": "הגדרות",
}

export function Header() {
    const location = useLocation()
    const pageTitle = pageTitles[location.pathname] || "דשבורד"

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{pageTitle}</h2>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}
