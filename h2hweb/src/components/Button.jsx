import React from "react";

function Button({ text, color = "green", onClick, type = "button" }) {
  return (
    <button
      className={`${color === "green" && "bg-emerald-700"} ${
        color === "red" && "bg-red-900"
      } cursor-pointer mx-auto inline my-auto text-sm px-4 py-1.5 rounded-lg font-semibold`}
      onClick={onClick}
      type={type}
    >
      {text}
    </button>
  );
}

export default Button;
