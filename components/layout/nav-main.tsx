"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

function matchesRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavMain({
  items,
  counts,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
  counts: {
    station: number;
    tank: number;
    dispenser: number;
    nozzle: number;
  };
}) {
  const pathname = usePathname();

  const countFor = (title: string): number | undefined => {
    switch (title) {
      case "Station Overview":
        return counts.station;
      case "Tanks":
        return counts.tank;
      case "Dispensers":
        return counts.dispenser;
      case "Nozzles":
        return counts.nozzle;
      default:
        return undefined;
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemIsActive =
            matchesRoute(pathname, item.url) ||
            (item.url === "/tanks" && pathname.startsWith("/tanks/")) ||
            (item.url === "/stations" && pathname.startsWith("/stations/"));
          const count = countFor(item.title);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={itemIsActive}
                aria-current={itemIsActive ? "page" : undefined}
                tooltip={item.title}
                render={<Link href={item.url} />}
              >
                {item.icon}
                <span>{item.title}</span>
                {count !== undefined && <span className="ml-auto text-xs text-muted-foreground">{count}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
