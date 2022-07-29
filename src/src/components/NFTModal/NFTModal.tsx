import React, { Children, Component } from "react";
import { styled, keyframes } from "@stitches/react";
import { blackA, mauve } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { NFTDetail } from "../NFTDetail/NFTDetail";
import { AuctionView } from "../AuctionView/AuctionView";
import { AuctionBid } from "../AuctionBid/AuctionBid";
import { AuctionCreate } from "../AuctionCreate/AuctionCreate";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: blackA.blackA9,
  position: "fixed",
  inset: 0,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: "white",
  borderRadius: 6,
  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  overflow: "hidden",
  maxWidth: "900px",
  maxHeight: "85vh",
  padding: 0,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
  "&:focus": { outline: "none" },
});

const StyledTitle = styled(DialogPrimitive.Title, {
  margin: 0,
  fontWeight: 500,
  color: mauve.mauve12,
  fontSize: 17,
});

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: "10px 0 20px",
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

// Exports
export const Dialog = DialogPrimitive.Root;
export const DialogContent = DialogPrimitive.Portal;
export const DialogTitle = StyledTitle;
export const DialogDescription = StyledDescription;
export const DialogClose = DialogPrimitive.Close;

// Your app...
const Flex = styled("div", { display: "flex" });
const Box = styled("div", {});

type Props = {
  show: string;
  setShow: React.Dispatch<React.SetStateAction<string>>;
  tokenId: string;
  setTokenId: React.Dispatch<React.SetStateAction<string>>;
};

const NFTModal = ({ show, setShow, tokenId, setTokenId }: Props) => {
  const handleClose = () => {
    window.history.replaceState({}, "", `${window.location.pathname}`);
    setShow("");
  };

  const fillError = (error: string) => {
    switch (error) {
      case "userRejected":
        return "Transaction rejected by user";
        break;

      default:
        return "Please try again";
        break;
    }
  };

  return (
    <Dialog open={show !== ""}>
      <DialogContent>
        <StyledOverlay />
        <StyledContent>
          {show === "NFTDetail" && <NFTDetail id={tokenId} />}
          {show === "AuctionView" && <AuctionView id={tokenId} />}
          {show === "AuctionBid" && <AuctionBid id={tokenId} />}
          {show === "AuctionCreate" && <AuctionCreate id={tokenId} />}
          <DialogClose
            style={{
              position: "absolute",
              top: "10",
              right: "10px",
              cursor: "pointer",
            }}
            asChild
            onClick={handleClose}
          >
            <Cross2Icon width="25px" height="25px" />
          </DialogClose>
        </StyledContent>
      </DialogContent>
    </Dialog>
  );
};

export default NFTModal;
