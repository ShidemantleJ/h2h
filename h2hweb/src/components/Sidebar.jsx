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
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Menu Icon to collapse sidebar */}
      {/* Sidebar Parent Div */}
      <div
        onMouseEnter={() => {
          setCollapsed(false);
        }}
        onMouseLeave={() => {
          setCollapsed(true);
        }}
        className={`
          fixed
          bg-zinc-900
          transition-all duration-300 ease-in-out
          border-r border-zinc-700
          top-0 h-dvh
          z-50
          ${
            collapsed
              ? "w-0 lg:w-20 p-0 pr-3 py-5 lg:p-5"
              : "w-64 p-5 shadow-[5px_0_25px_0_rgba(0,0,0,0.25)]"
          }
        `}
      >
        <Menu
          className="block lg:hidden transition-all duration-400 absolute z-50 -right-3 text-zinc-300 cursor-pointer"
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
                  key="My Profile"
                  link={`/users/${user?.dbInfo?.id}`}
                  variant="normal"
                />
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<LogOut />}
                  name="Log Out"
                  key="Log Out"
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
