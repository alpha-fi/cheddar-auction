import React, { Children, Component } from "react";
import { styled, keyframes } from "@stitches/react";
import { blackA, mauve } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { NFTDetail } from "../NFTDetail/NFTDetail";
import { AuctionView } from "../AuctionView/AuctionView";
import { AuctionBid } from "../AuctionBid/AuctionBid";
import { AuctionCreate } from "../AuctionCreate/AuctionCreate";
import Spinner from "../Spinner/Spinner";
import { ShowModal } from "../Marketplace/Marketplace";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const contentShow = keyframes({
  "0%": { opacity: 0 },
  "25%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: blackA.blackA11,
  position: "fixed",
  inset: 0,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 1000ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: "#ebe7f5",
  borderRadius: 6,
  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  position: "fixed",
  transform: "translate(-50%, -50%)",
  top: "50%",
  left: "50%",
  width: "90vw",
  overflow: "auto",
  maxWidth: "45vh",
  padding: 0,
  maxHeight: "98vh",
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 1000ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
  "@media (min-width: 576px)": {
    maxWidth: "900px",
    width: "98vw",
    overflow: "hidden",
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

type Props = {
  show: ShowModal;
  setShow: React.Dispatch<React.SetStateAction<ShowModal>>;
};

const NFTModal = ({ show, setShow }: Props) => {
  const handleClose = () => {
    window.history.replaceState({}, "", `${window.location.pathname}`);
    setShow({ name: "", nft: null, loading: false });
  };

  return (
    <>
      {false && show.loading && <Spinner />}
      <Dialog open={show.name !== ""}>
        <DialogContent>
          <StyledOverlay />
          <StyledContent>
            {show.name === "NFTDetail" && (
              <NFTDetail show={show} setShow={setShow} />
            )}
            {show.name === "AuctionView" && (
              <AuctionView show={show} setShow={setShow} />
            )}
            {show.name === "AuctionBid" && (
              <AuctionBid show={show} setShow={setShow} />
            )}
            {show.name === "AuctionCreate" && (
              <AuctionCreate show={show} setShow={setShow} />
            )}
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
    </>
  );
};

export default NFTModal;
