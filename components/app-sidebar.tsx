"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, LayoutDashboardIcon, DatabaseIcon, FuelIcon, CableIcon } from "lucide-react"

const data = {
  user: {
    name: "Service Engineer",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Station Overview",
      url: "/",
      icon: (
        <LayoutDashboardIcon
        />
      ),
      isActive: true,
    },
    {
      title: "Tanks",
      url: "/tanks",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      title: "Dispensers",
      url: "/dispensers",
      icon: (
        <FuelIcon
        />
      ),
    },
    {
      title: "Nozzles",
      url: "/nozzles",
      icon: (
        <CableIcon
        />
      ),
    },
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:size-6">
            <GalleryVerticalEndIcon aria-hidden="true" className="size-4" />
          </span>
          <span className="grid min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">Dover</span>
            <span className="truncate text-xs text-muted-foreground">Station network</span>
          </span>
        </div>
        {state === "expanded" && <SidebarTrigger className="shrink-0" />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
