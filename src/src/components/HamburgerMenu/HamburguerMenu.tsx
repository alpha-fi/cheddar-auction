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
    if (currentPath.split("/")[1] == "") return true;
  };

  const { wallet, signIn, signOut } = useNear();

  const singOutAndRedirect = () => {
    navigate("/");
    if (signOut) {
      signOut();
    }
  };

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
        <div
          className={css.link}
          onClick={() => handleClose("/")}
          style={{
            background: isMarketplace() ? "#3333" : "",
          }}
        >
          <span
            style={{
              fontSize: "24px",
            }}
          >
            Marketplace
          </span>
        </div>
        {wallet && wallet.getAccountId() && (
          <div
            className={css.link}
            onClick={() => handleClose("/myassets")}
            style={{
              background: !isMarketplace() ? "#3333" : "",
            }}
          >
            <span
              style={{
                fontSize: "24px",
              }}
            >
              My&nbsp;Assets
            </span>
          </div>
        )}
        {wallet &&
          (wallet.getAccountId() ? (
            <div style={{ padding: "8px 32px 8px 32px" }}>
              <Dropdown
                trigger={
                  wallet?.getAccountId().length > 16
                    ? wallet?.getAccountId().substring(0, 16) + "..."
                    : wallet?.getAccountId()
                }
                items={[
                  {
                    children: "Sign Out",
                    onSelect: singOutAndRedirect,
                  },
                ]}
              />
            </div>
          ) : (
            <div style={{ padding: "8px 32px 8px 32px" }}>
              <button className="yellow" onClick={signIn}>
                Sign In
              </button>
            </div>
          ))}
      </div>
      <button
        className={css.openbtn}
        onClick={handleOpen}
        style={{ backgroundColor: "#ffd262", height: "45px", width: "45px" }}
      >
        <HamburgerMenuIcon
          color="black"
          height="30px"
          width="30px"
          style={{ verticalAlign: "middle" }}
        />
      </button>
    </>
  );
};
