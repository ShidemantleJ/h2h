import React from "react";
import { useNavigate } from "react-router-dom";

function SidebarLink(props) {
  const icon = props.icon;
  const link = props.link;
  const name = props.name;
  const dropdownCollapsed = props.dropdownCollapsed;
  const variant = props.variant;
  const navigate = useNavigate();
  switch (variant) {
    case "normal":
      return (
        <div>
          <li
            onClick={() => navigate(link)}
            className="flex items-center cursor-pointer rounded-md hover:bg-zinc-800 transition-all duration-400 p-2"
          >
            <div className="font-sans justify-center text-zinc-300 inline-block">
              {icon}
            </div>
            <a className={`ml-2 font-sans text-zinc-300 whitespace-nowrap`}>
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
          onClick={() =>
            (window.location.href = `${
              import.meta.env.VITE_BACKEND_URL
            }/auth/logout`)
          }
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
