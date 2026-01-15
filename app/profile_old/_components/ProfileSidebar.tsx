"use client";

import { cn } from "@/lib/utils";

type SidebarItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

type ProfileSidebarProps = {
  items: readonly SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

const ProfileSidebarItem = ({
  item,
  isActive,
  onSelect,
}: {
  item: SidebarItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => (
  <li>
    <button
      type="button"
      disabled={item.disabled}
      onClick={() => onSelect(item.id)}
      className={cn(
        "w-full px-4 py-3 text-left text-sm font-medium transition",
        isActive ? "bg-muted font-semibold" : "hover:bg-muted/70",
        item.disabled ? "cursor-not-allowed text-muted-foreground" : ""
      )}
    >
      {item.label}
    </button>
  </li>
);

const ProfileSidebar = ({ items, activeId, onSelect }: ProfileSidebarProps) => (
  <nav className="rounded-lg border bg-white">
    <ul className="flex flex-col">
      {items.map((item) => (
        <ProfileSidebarItem
          key={item.id}
          item={item}
          isActive={item.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  </nav>
);

export default ProfileSidebar;
