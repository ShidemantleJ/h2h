import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const numMatchNotifs = user?.matchInviteInfo?.incomingReqs?.length || 0;
  const numFriendNotifs = user?.friendInfo?.incomingReqs?.length || 0;
  // console.log(user);
  switch (variant) {
    case "normal":
      return (
        <div>
          <li
            onClick={() => navigate(link)}
            className="flex items-center cursor-pointer rounded-md hover:bg-zinc-800 transition-all duration-400 p-2"
          >
            <div className="font-sans justify-center text-zinc-300 inline-block relative">
              {link === "/play" && <NotifCircle numNotifs={numMatchNotifs} />}
              {link === "/friends" && (
                <NotifCircle numNotifs={numFriendNotifs} />
              )}
              {icon}
            </div>
            <a className={`ml-2 font-sans text-zinc-300 whitespace-nowrap`} href={link}>
              {name}
            </a>
          </li>
        </div>
      );
      break;
    case "button":
      return (
        <li
          className="flex items-center cursor-pointer mt-3 p-2 rounded-[6px] bg-emerald-700 hover:bg-emerald-800 transition-all duration-400 text-center text-zinc-200 font-sans font-semibold"
          onClick={() => (window.location.href = link)}
        >
          <div className="font-sans justify-center text-zinc-300 inline-block">
            {icon}
          </div>
          <p className={`ml-2 whitespace-nowrap`}>{name}</p>
        </li>
      );
      break;
  }
}

export default SidebarLink;
