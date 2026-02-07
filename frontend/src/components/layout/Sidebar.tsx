import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Home,
    Users,
    Coins,
    LogOut,
    Menu,
    X,
    Grid3X3,
    Settings
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSidebar } from "@/contexts/SidebarContext"

const sidebarItems = [
    {
        title: "לוח בקרה",
        href: "/dashboard",
        icon: Home,
    },
    {
        title: "ניהול הוצאות",
        href: "/categories",
        icon: Coins,
    },
    {
        title: "מוזמנים",
        href: "/guests",
        icon: Users,
    },
    {
        title: "סידורי הושבה",
        href: "/seating",
        icon: Grid3X3,
    },
]

const settingsItem = {
    title: "הגדרות",
    href: "/wedding-setup",
    icon: Settings,
}

export function Sidebar() {
    const location = useLocation()
    const { logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const { isCollapsed, toggleCollapsed } = useSidebar()

    // On mobile (when isOpen), always show expanded sidebar
    const showCollapsed = isCollapsed && !isOpen

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-all duration-300 ease-in-out outline-none",
                    isOpen ? "flex" : "hidden md:flex",
                    showCollapsed && "md:w-20"
                )}
            >
                <div className="flex h-full w-full flex-col">
                    <div className={cn("flex h-16 items-center px-4", showCollapsed ? "justify-center" : "justify-between")}>
                        {!showCollapsed && (
                            <Link to="/dashboard" className="flex items-center gap-2 font-semibold overflow-hidden whitespace-nowrap">
                                <span className="text-xl font-bold text-primary">Hayde</span>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex"
                            onClick={toggleCollapsed}
                        >
                            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="grid gap-1 px-2">
                            {sidebarItems.map((item, index) => {
                                const isActive = location.pathname.startsWith(item.href)
                                return (
                                    <Link
                                        key={index}
                                        to={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                                            showCollapsed && "justify-center px-2"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                        title={showCollapsed ? item.title : undefined}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" />
                                        {!showCollapsed && <span>{item.title}</span>}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto border-t p-4 space-y-2">
                        <Link
                            to={settingsItem.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                location.pathname.startsWith(settingsItem.href) ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                                showCollapsed && "justify-center px-2"
                            )}
                            onClick={() => setIsOpen(false)}
                            title={showCollapsed ? settingsItem.title : undefined}
                        >
                            <settingsItem.icon className="h-4 w-4 flex-shrink-0" />
                            {!showCollapsed && <span>{settingsItem.title}</span>}
                        </Link>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full text-muted-foreground hover:text-foreground",
                                showCollapsed ? "justify-center px-2" : "justify-start gap-2"
                            )}
                            onClick={logout}
                            title={showCollapsed ? "Log out" : undefined}
                        >
                            <LogOut className="h-4 w-4 flex-shrink-0" />
                            {!showCollapsed && <span>Log out</span>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
