import css from "./Spinner.module.css";
import imgCheddar from "./cheddar.svg";

export default function Spinner() {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        marginTop: "-30px",
        marginLeft: "-35px",
        zIndex: 100,
      }}
    >
      <img
        className={css.cheddar_spinner}
        src={imgCheddar}
        alt="Cheddar Logo"
        height={60}
        width={60}
      />
    </div>
  );
}
