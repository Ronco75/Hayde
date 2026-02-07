import { useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

const pageTitles: Record<string, string> = {
    "/": "לוח בקרה",
    "/dashboard": "לוח בקרה",
    "/categories": "קטגוריות",
    "/expenses": "הוצאות",
    "/guests": "אורחים",
    "/seating": "סידורי הושבה",
    "/settings": "הגדרות",
    "/wedding-setup": "הגדרות",
}

export function Header() {
    const location = useLocation()
    const pageTitle = pageTitles[location.pathname] || "לוח בקרה"

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 pl-16 pr-6 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
