import css from "./HamburgerMenu.module.css";
import { HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Dropdown } from "../Dropdown/Dropdown";
import useNear from "../../hooks/useTenkNear";
import { useLocation, useNavigate } from "react-router-dom";

export const HamburgerMenu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleOpen = () => {
    setShowMenu(true);
  };

  const handleClose = (path = "") => {
    setShowMenu(false);
    if (path !== "") {
      navigate(path);
    }
  };

  let navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  const isMarketplace = () => {
    console.log("currentPath", currentPath, currentPath.split("/"));
    if (currentPath.split("/")[1] == "marketplace") return true;
  };

  const { wallet, signIn, signOut } = useNear();

  return (
    <>
      <div
        className={css.sidenavbg}
        style={{ display: showMenu ? "" : "none" }}
      ></div>
      <div
        className={css.sidenav}
        style={{
          width: showMenu ? "80vw" : "0vw",
        }}
      >
        {showMenu && (
          <Cross2Icon
            className={css.closebtn}
            onClick={() => handleClose()}
            style={{ cursor: "pointer" }}
            height="30px"
            width="30px"
          />
        )}
        <div className={css.link} onClick={() => handleClose("/marketplace")}>
          <span
            style={isMarketplace() ? { borderBottom: "2px solid black" } : {}}
          >
            Marketplace
          </span>
        </div>
        {wallet && wallet.getAccountId() && (
          <div className={css.link} onClick={() => handleClose("/")}>
            <span
              style={{
                borderBottom: !isMarketplace() ? "2px solid black" : "",
                marginRight: "15px",
              }}
            >
              My&nbsp;Assets
            </span>
          </div>
        )}
        {wallet &&
          (wallet.getAccountId() ? (
            <div style={{ padding: "8px 8px 8px 32px" }}>
              <Dropdown
                trigger={
                  wallet?.getAccountId().length > 16
                    ? wallet?.getAccountId().substring(0, 16) + "..."
                    : wallet?.getAccountId()
                }
                items={[
                  {
                    children: "Sign Out",
                    onSelect: signOut,
                  },
                ]}
              />
            </div>
          ) : (
            <button className="yellow" onClick={signIn}>
              Sign In
            </button>
          ))}
      </div>
      <button
        className={css.openbtn}
        onClick={handleOpen}
        style={{ backgroundColor: "#ffd262" }}
      >
        <HamburgerMenuIcon
          color="black"
          height="20px"
          width="20px"
          style={{ verticalAlign: "middle" }}
        />
      </button>
    </>
  );
};
