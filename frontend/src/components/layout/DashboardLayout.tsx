import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"
import { cn } from "@/lib/utils"

function DashboardContent() {
    const { isCollapsed } = useSidebar()

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className={cn(
                "flex flex-1 flex-col pl-0 transition-all duration-300",
                isCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <DashboardContent />
        </SidebarProvider>
    )
}
