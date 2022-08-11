import css from "./HamburgerMenu.module.css";
import { HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Dropdown } from "../Dropdown/Dropdown";
import useNear from "../../hooks/useTenkNear";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import checkersIcon from "../../Assets/imgs/checkers-icon.svg";
import cheddarIcon from "../../Assets/imgs/cheddar-icon.svg";
import gamepadIcon from "../../Assets/imgs/gamepad-icon.svg";
import paletteIcon from "../../Assets/imgs/palette-icon.svg";
import swapIcon from "../../Assets/imgs/swap-icon.svg";
import thunderIcon from "../../Assets/imgs/thunder-icon.svg";
import { styled } from "@stitches/react";

const CheddarLinks = styled("a", {
  padding: "1px 6px",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderRadius: "6px",
  margin: "0px 0px",
});

type Props = {
  screenWidth: number;
};

export const HamburgerMenu = ({ screenWidth }: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleOpen = () => {
    setShowMenu(true);
  };

  const handleClose = (path = "") => {
    setShowMenu(false);
    if (path !== "") {
      navigate(path);
    }
  };

  const pagesBreakpoint = 576;

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

  const signInWhitSpinner = () => {
    if (signIn) {
      setLoading(true);
      signIn();
    }
  };

  return (
    <>
      <div
        className={css.sidenavbg}
        style={{ display: showMenu ? "" : "none" }}
      ></div>
      {loading ? (
        <Spinner />
      ) : (
        <div
          className={css.sidenav}
          style={{
            width: showMenu ? "80vw" : "0vw",
            fontSize: screenWidth < pagesBreakpoint ? "22px" : "18px",
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
          {screenWidth < pagesBreakpoint && (
            <div
              className={css.link}
              onClick={() => handleClose("/")}
              style={{
                background: isMarketplace() ? "#ffd26288" : "",
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
          )}
          {wallet && wallet.getAccountId() && screenWidth < pagesBreakpoint && (
            <div
              className={css.link}
              onClick={() => handleClose("/myassets")}
              style={{
                background: !isMarketplace() ? "#ffd26288" : "",
                marginBottom: "20px",
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
          <CheddarLinks href="https://draw.cheddar.farm" target="_blank">
            Draw&nbsp;
            <img src={paletteIcon} alt="" width={32} height={32} />
          </CheddarLinks>
          <CheddarLinks
            href="https://vps179324.iceservers.net/"
            target="_blank"
          >
            Coinflip&nbsp;
            <img src={cheddarIcon} alt="" width={26} height={26} />
          </CheddarLinks>
          <CheddarLinks href="https://checkers.cheddar.farm/" target="_blank">
            Checkers&nbsp;
            <img src={checkersIcon} alt="" width={26} height={26} />
          </CheddarLinks>
          <CheddarLinks
            href="https://nearhub.club/cdcUv8P/cheddar-farm"
            target="_blank"
          >
            Vr&nbsp;Farm&nbsp;
            <img src={gamepadIcon} alt="" width={26} height={26} />
          </CheddarLinks>
          <CheddarLinks href="https://nft.cheddar.farm/" target="_blank">
            Power&nbsp;Up&nbsp;
            <img src={thunderIcon} alt="" width={26} height={26} />
          </CheddarLinks>
          <CheddarLinks
            href="https://app.ref.finance/#token.cheddar.near%7Cwrap.near"
            target="_blank"
          >
            Ref&nbsp;Swap&nbsp;
            <img
              src={swapIcon}
              alt=""
              width={26}
              height={26}
              style={{
                borderRadius: "13px",
                padding: "2px",
                background: "#8542eb44",
              }}
            />
          </CheddarLinks>

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
                <button className="yellow" onClick={signInWhitSpinner}>
                  Sign In
                </button>
              </div>
            ))}
        </div>
      )}
      <button
        className={css.openbtn}
        onClick={handleOpen}
        style={{
          backgroundColor: "#ffd262",
          height: screenWidth < pagesBreakpoint ? "45px" : "30px",
          width: screenWidth < pagesBreakpoint ? "45px" : "30px",
        }}
      >
        <HamburgerMenuIcon
          color="black"
          height={screenWidth < pagesBreakpoint ? "30px" : "16px"}
          width={screenWidth < pagesBreakpoint ? "30px" : "16px"}
          style={{ verticalAlign: "middle" }}
        />
      </button>
    </>
  );
};
