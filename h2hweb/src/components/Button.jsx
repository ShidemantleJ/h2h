import React from "react";

function Button({ text, color = "green", onClick, type = "button" }) {
  return (
    <button
      className={`${color === "green" && "bg-emerald-700 hover:bg-emerald-800"} ${
        color === "red" && "bg-red-900 hover:bg-red-950"
      } transition-all duration-400 cursor-pointer mx-auto inline my-auto text-sm px-4 py-1.5 rounded-lg font-semibold`}
      onClick={onClick}
      type={type}
    >
      {text}
    </button>
  );
}

export default Button;
