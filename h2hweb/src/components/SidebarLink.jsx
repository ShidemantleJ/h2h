import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../user/UserContext";

function NotifCircle({ numNotifs }) {
  return (
    numNotifs > 0 && (
      <div className="absolute -top-2 -left-2 bg-red-800 text-xs font-semibold rounded-4xl w-4 h-4 flex items-center justify-center">
        {numNotifs}
      </div>
    )
  );
}

function SidebarLink(props) {
  const icon = props.icon;
  const link = props.link;
  const name = props.name;
  const dropdownCollapsed = props.dropdownCollapsed;
  const variant = props.variant;
  const { user } = useContext(UserContext);
  const numMatchNotifs = user?.matchInviteInfo?.incomingReqs?.length || 0;
  const numFriendNotifs = user?.friendInfo?.incomingReqs?.length || 0;
  // console.log(user);
  switch (variant) {
    case "normal":
      return (
        <li className="flex items-center rounded-md hover:bg-zinc-800 transition-all duration-400 p-2">
          <Link
            to={link}
            className="flex items-center w-full h-full cursor-pointer"
            aria-label={name}
            tabIndex={0}
            role="menuitem"
          >
            <span className="font-sans justify-center text-zinc-300 inline-block relative">
              {link === "/play" && <NotifCircle numNotifs={numMatchNotifs} />}
              {link === "/friends" && (
                <NotifCircle numNotifs={numFriendNotifs} />
              )}
              {icon}
            </span>
            <span className={`ml-2 font-sans text-zinc-300 whitespace-nowrap`}>
              {name}
            </span>
          </Link>
        </li>
      );
      break;
    case "button":
      return (
        <li
          className="flex items-center cursor-pointer mt-3 p-2 rounded-[6px] bg-emerald-700 hover:bg-emerald-800 transition-all duration-400 text-center text-zinc-200 font-sans font-semibold"
          role="none"
        >
          <Link
            to={link}
            className="flex items-center w-full h-full cursor-pointer"
            aria-label={name}
            tabIndex={0}
            role="menuitem"
          >
            <span className="font-sans justify-center text-zinc-300 inline-block">
              {icon}
            </span>
            <span className={`ml-2 whitespace-nowrap`}>{name}</span>
          </Link>
        </li>
      );
      break;
  }
}

export default SidebarLink;
