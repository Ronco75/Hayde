import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    HeartHandshake
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSidebar } from "@/contexts/SidebarContext"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Categories",
        href: "/categories",
        icon: Settings, // Using Settings icon for Categories as a placeholder or adjust semantic meaning
    },
    {
        title: "Guests",
        href: "/guests",
        icon: Users,
    },
    {
        title: "Wedding Setup",
        href: "/wedding-setup",
        icon: HeartHandshake,
    },
]

export function Sidebar() {
    const location = useLocation()
    const { logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const { isCollapsed, toggleCollapsed } = useSidebar()

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
                    "fixed inset-y-0 left-0 z-40 transform bg-card border-r transition-all duration-300 ease-in-out md:translate-x-0 outline-none",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isCollapsed ? "md:w-20" : "md:w-64"
                )}
            >
                <div className="flex h-full flex-col">
                    <div className={cn("flex h-16 items-center px-4", isCollapsed ? "justify-center" : "justify-between")}>
                        {!isCollapsed && (
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
                                            isCollapsed && "justify-center px-2"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                        title={isCollapsed ? item.title : undefined}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" />
                                        {!isCollapsed && <span>{item.title}</span>}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto border-t p-4">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full text-muted-foreground hover:text-foreground",
                                isCollapsed ? "justify-center px-2" : "justify-start gap-2"
                            )}
                            onClick={logout}
                            title={isCollapsed ? "Log out" : undefined}
                        >
                            <LogOut className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && <span>Log out</span>}
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
