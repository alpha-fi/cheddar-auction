import css from "./Footer.module.css"
export const Footer = () => {
    return (
        <footer className={css.footer_module + " container"}>
            <div className={css.footer_module_launcher}>
                <span>A <a href="https://tenk.dev/" target="_blank ">TenK</a> Contract &amp; UI Fork, powered by 🧀</span>                
            </div>
        </footer>
    )
}