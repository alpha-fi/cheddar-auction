import { useNavigate, useLocation } from "react-router-dom";

import css from "./Header.module.css";
import useNear from "../../hooks/useTenkNear";
import { Dropdown } from "../Dropdown/Dropdown";
import { HamburgerMenu } from "../HamburgerMenu/HamburguerMenu";
import useScreenSize from "../../hooks/useScreenSize";
import { useState } from "react";
import Spinner from "../Spinner/Spinner";

export const Header = () => {
  let navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState<boolean>(false);

  const { wallet, signIn, signOut } = useNear();

  const isMarketplace = () => {
    if (currentPath.split("/")[1] == "") return true;
  };

  const { width } = useScreenSize();

  const hamburgerBreakpoint = 576;

  const singOutAndRedirect = () => {
    navigate("/");
    if (signOut) {
      signOut();
    }
  };

  const signInWhitSpinner = () => {
    if (signIn) {
      setLoading(true);
      signIn();
    }
  };

  return (
    <nav className={css.header}>
      <div className={css.header_container}>
        <div className={css.header_container_content + " container"}>
          <div
            className={css.header_social_container}
            style={{ justifyContent: "start" }}
          >
            <a
              href="https://discord.com/invite/XVBxDBqP2v"
              target="_blank"
              style={{ display: "flex", alignContent: "center" }}
              rel="noopener noreferrer"
              title="Discord"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 26"
                style={{ width: width < 576 ? "40px" : "24px" }}
              >
                <path
                  fill="#8542eb"
                  fillRule="evenodd"
                  d="M15.92 12.07a1.4 1.4 0 0 1-2.14 1.2 1.42 1.42 0 0 1-.66-1.2 1.4 1.4 0 1 1 2.8 0ZM24 2.62v22.8a1436.37 1436.37 0 0 0-2.84-2.34l-2.5-2.13-1.02-.89.72 2.35H2.81C1.26 22.41 0 21.24 0 19.8V2.62C0 1.17 1.26 0 2.81 0H21.2C22.74 0 24 1.17 24 2.62Zm-9.01 12.94a4.33 4.33 0 0 0 2.48-1.5 10.7 10.7 0 0 1-10.2.27l-.23-.13-.27-.16s.29.44.97.87c.36.23.83.46 1.43.63-.4.48-.91 1.05-.91 1.05a5.88 5.88 0 0 1-3.01-.85 3.89 3.89 0 0 1-1.18-1.08c0-4.09 1.98-7.4 1.98-7.4C8.02 5.88 9.9 5.92 9.9 5.92l.14.15a9.52 9.52 0 0 0-3.6 1.67s.3-.16.8-.37a12.48 12.48 0 0 1 10.25.37l-.21-.16A8.19 8.19 0 0 0 16 6.84c-.5-.24-1.15-.5-1.93-.72l.2-.2s1.23-.02 2.76.7c.35.17.72.38 1.09.64 0 0 1.97 3.31 1.97 7.4 0 0-1.16 1.84-4.2 1.93 0 0-.49-.54-.9-1.03Zm-6.87-3.5a1.4 1.4 0 1 1 2.8 0 1.4 1.4 0 0 1-1.4 1.42c-.77 0-1.4-.64-1.4-1.41Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            <a
              href="https://twitter.com/CheddarFi"
              target="_blank"
              style={{ display: "flex", alignContent: "center" }}
              rel="noopener noreferrer"
              title="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                style={{ width: width < 576 ? "40px" : "24px" }}
              >
                <path
                  fill="#8542eb"
                  d="M21.53 7.11c.02.22.02.43.02.64 0 6.5-4.95 14-14 14-2.78 0-5.37-.81-7.55-2.21a10.17 10.17 0 0 0 7.3-2.04 4.93 4.93 0 0 1-4.6-3.41 5.2 5.2 0 0 0 2.22-.1A4.92 4.92 0 0 1 .97 9.18V9.1c.66.36 1.42.6 2.23.62a4.92 4.92 0 0 1-1.52-6.58A13.98 13.98 0 0 0 11.82 8.3a4.92 4.92 0 0 1 8.4-4.5 9.68 9.68 0 0 0 3.11-1.18 4.9 4.9 0 0 1-2.16 2.71c.99-.1 1.95-.38 2.83-.76-.67.97-1.5 1.84-2.47 2.54Z"
                ></path>
              </svg>
            </a>
          </div>
          {width >= hamburgerBreakpoint && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                className={css.header_tab}
                style={
                  isMarketplace() ? { borderBottom: "2px solid black" } : {}
                }
                onClick={(e) => navigate("/")}
              >
                Marketplace
              </div>
              {wallet && wallet.getAccountId() && (
                <div
                  className={css.header_tab}
                  style={{
                    borderBottom: !isMarketplace() ? "2px solid black" : "",
                    marginRight: "15px",
                  }}
                  onClick={(e) => navigate("/myassets")}
                >
                  My&nbsp;Assets
                </div>
              )}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            {width >= hamburgerBreakpoint &&
              wallet &&
              (wallet.getAccountId() ? (
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
              ) : (
                <button className="yellow" onClick={signInWhitSpinner}>
                  Sign In
                </button>
              ))}
          </div>
          {width < hamburgerBreakpoint && (
            <div
              style={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              {" "}
              <HamburgerMenu />
            </div>
          )}
        </div>
      </div>
      {loading && <Spinner showOverlay={true} />}
    </nav>
  );
};
