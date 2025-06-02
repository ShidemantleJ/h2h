import React from "react";
import SidebarLink from "./SidebarLink";

function SidebarLinkList(props) {
  const items = props.items;
  const dropdownCollapsed = props.dropdownCollapsed;
  const variant = props.variant;
  
  return (
    <ul className="space-y-1">
      {items.map(([icon, name, link], index) => {
        return (
          <SidebarLink
            dropdownCollapsed={dropdownCollapsed}
            icon={icon}
            name={name}
            link={link}
            key={index}
            variant={variant}
          />
        );
      })}
    </ul>
  );
}

export default SidebarLinkList;
