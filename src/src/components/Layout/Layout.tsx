import React from "react"
import "./layout.scss"

export const Layout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <div className="container">
      {children}
    </div>
  )
}