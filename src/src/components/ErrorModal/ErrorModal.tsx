import React from "react";
import { styled, keyframes } from "@stitches/react";
import { violet, blackA, mauve } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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
  maxWidth: "450px",
  maxHeight: "85vh",
  padding: 25,
  zIndex: 100,
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

type Props = {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

const ErrorModal = ({ error, setError }: Props) => {
  const handleClose = () => {
    window.history.replaceState({}, "", `${window.location.pathname}`);
    setError("");
  };

  const fillError = (error: string) => {
    switch (error) {
      case "userRejected":
        return "Transaction rejected by user";

      default:
        return "Please try again";
    }
  };

  return (
    <Dialog open={error !== ""}>
      <DialogContent>
        <StyledOverlay />
        <StyledContent>
          <DialogTitle>Error</DialogTitle>
          <DialogDescription>{fillError(error)}</DialogDescription>
          <Flex css={{ marginTop: 25, justifyContent: "flex-end" }}>
            <DialogClose asChild>
              <button className="purple" onClick={handleClose}>
                Ok
              </button>
            </DialogClose>
          </Flex>
        </StyledContent>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;
