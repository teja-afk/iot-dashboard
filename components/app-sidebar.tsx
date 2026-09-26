"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, LayoutDashboardIcon, DatabaseIcon, FuelIcon, CableIcon } from "lucide-react"

const data = {
  user: {
    name: "Service Engineer",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Dover",
      plan: "Station network",
      logo: (
        <GalleryVerticalEndIcon
        />
      )
    },
    {
      name: "IOCL",
      plan: "Station network",
      logo: (
        <AudioLinesIcon
        />
      )
    },
    {
      name: "BPCL",
      plan: "Station network",
      logo: (
        <AudioLinesIcon
        />
      )
    },
  ],
  navMain: [
    {
      title: "Station Overview",
      url: "/",
      icon: (
        <LayoutDashboardIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Live status",
          url: "/",
        },
      ],
    },
    {
      title: "Tank",
      url: "/tank",
      icon: (
        <DatabaseIcon
        />
      ),
      items: [
        {
          title: "Reports",
          url: "/tank/reports",
        },
      ],
    },
    {
      title: "Dispenser",
      url: "/dispensers",
      icon: (
        <FuelIcon
        />
      ),
      items: [
        {
          title: "Reports",
          url: "/dispensers/reports",
        },
      ],
    },
    {
      title: "Nozzle",
      url: "/nozzles",
      icon: (
        <CableIcon
        />
      ),
      items: [
        {
          title: "Reports",
          url: "/nozzles/reports",
        },
      ],
    },
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
