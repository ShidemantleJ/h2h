import {
  Play,
  User,
  Users,
  Home,
  CircleArrowLeft,
  LogOut,
  LogIn,
  Menu,
} from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../user/UserContext";
import SidebarItemList from "./SidebarLinkList";
import SidebarLink from "./SidebarLink";

const topSidebarElements = [
  [<Home />, "Home", "/"],
  [<Play />, "Play", "/play"],
  [<Users />, "Friends", "/friends"],
];

const Sidebar = (props) => {
  const { user } = useContext(UserContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Menu Icon to collapse sidebar */}
      {/* Sidebar Parent Div */}
      <div
        className={`
    fixed lg:sticky
    bg-zinc-900
    transition-[width] duration-400
    shrink-0
    border-zinc-700 border-r-1
    top-0 h-dvh
    ${collapsed ? "z-50" : "z-20"}
    ${collapsed ? "w-0 pt-5 pl-5 lg:w-20 lg:p-5" : "w-58 p-5"}
  `}
      >
        <Menu
          className="block transition-all duration-400 absolute z-50 -right-3 text-zinc-300 cursor-pointer"
          onClick={() => setCollapsed((prev) => !prev)}
        />
        {/* Sidebar Items */}
        <div className={`overflow-hidden flex flex-col justify-between h-full`}>
          {/* Sidebar Top Items List */}
          <ul className="block">
            <SidebarItemList
              variant="normal"
              dropdownCollapsed={collapsed}
              items={topSidebarElements}
            />
          </ul>

          {/* Sidebar Bottom Items List */}
          <ul className="block">
            {user ? (
              <>
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<User />}
                  name="My Profile"
                  link={`/users/${user?.dbInfo?.id}`}
                  variant="normal"
                />
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<LogOut />}
                  name="Log Out"
                  link={`${import.meta.env.VITE_BACKEND_URL}/auth/logout`}
                  variant="button"
                />
              </>
            ) : (
              <>
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<LogIn />}
                  name="Log in with WCA ID"
                  link={`${import.meta.env.VITE_BACKEND_URL}/auth/wca`}
                  variant="button"
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
