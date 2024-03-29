import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import css from "./dropdown.module.css";

export const Dropdown: React.FC<
  React.PropsWithChildren<{
    trigger: React.ReactChild;
    items:
      | DropdownMenu.MenuItemProps[]
      | Record<string, DropdownMenu.MenuItemProps[]>;
  }>
> = ({ trigger, items }) => {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className={css.trigger} color="white">
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className={css.content}>
        {Array.isArray(items)
          ? items.map(({ className, ...props }, i) => (
              <DropdownMenu.Item
                key={i}
                className={`${css.item} ${className}`}
                {...props}
              />
            ))
          : Object.entries(items).map(([label, subItems]) => (
              <DropdownMenu.Root key={label}>
                <DropdownMenu.SubTrigger className={css.item}>
                  {label} →
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Content className={css.content}>
                  {subItems.map(({ className, ...props }, i) => (
                    <DropdownMenu.Item
                      key={i}
                      className={`${css.item} ${className}`}
                      {...props}
                    />
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ))}
        <DropdownMenu.Arrow className={css.arrow} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
