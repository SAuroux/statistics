import { UserOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import MenuItem from "antd/lib/menu/MenuItem";
import { useState } from "react";
import { Link } from "react-router-dom";
import wcaApi from "../api/wca.api";
import logo from "../assets/wca_logo.svg";
import { LinkItem } from "../model/LinkItem";
import { StatisticsItem } from "../model/StatisticItem";
import "./Topbar.css";

interface TopbarProps {
  links: LinkItem[];
  statisticsList: StatisticsItem[];
}

const STATISTICS_LIST = "Statistics List";

const { SubMenu } = Menu;

const Topbar = ({ links, statisticsList }: TopbarProps) => {
  const [logged, setLogged] = useState(wcaApi.isLogged());

  const handle = () => {
    if (logged) {
      wcaApi.logout();
      setLogged(false);
    } else {
      wcaApi.handleLogin();
    }
  };

  const statisticsListLink = links.find((it) => it.name === STATISTICS_LIST);

  return (
    <Menu theme="dark" mode="horizontal" id="top-bar">
      <Menu.Item key="logo">
        <Link to={links[0].href}>
          <img src={logo} width="30" height="30" alt="Logo" />
        </Link>
      </Menu.Item>
      {links
        .filter((link) => link.name !== STATISTICS_LIST)
        .map((link) => (
          <MenuItem key={link.href}>
            <Link to={link.href} className="text-white align-center">
              <span>{link.icon}</span>
              {link.name}
            </Link>
          </MenuItem>
        ))}
      <SubMenu
        key="sub2"
        icon={statisticsListLink?.icon}
        title={<Link to="/statistics-list">Statistics List</Link>}
      >
        {statisticsList.map((stat) => (
          <Menu.Item key={stat.path}>
            <Link to={`/statistics-list/${stat.path}`}>{stat.title}</Link>
          </Menu.Item>
        ))}
      </SubMenu>
      <div id="login">
        <button onClick={handle}>
          {logged ? (
            <img
              src={wcaApi.getUserInfo()?.avatar?.thumb_url}
              width="30"
              height="30"
              alt="Avatar"
            />
          ) : (
            <UserOutlined />
          )}{" "}
          {logged ? "Logout" : "Login"}
        </button>
      </div>
    </Menu>
  );
};

export default Topbar;
