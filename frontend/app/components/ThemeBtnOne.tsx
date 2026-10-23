"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  text?: string;
  url?: string;
  className?: string;
  icon?: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

const ThemeBtnOne = ({
  text = "",
  url,
  className = "",
  icon,
  type = "button",
  disabled = false,
  onClick,
}: Props) => {
  const classes = `th-btn inline-flex items-center justify-center gap-2 ${
    disabled ? "pointer-events-none opacity-50" : ""
  } ${className}`;

  if (url) {
    return (
      <Link href={url} onClick={onClick} className={classes}>
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{text}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default ThemeBtnOne;
