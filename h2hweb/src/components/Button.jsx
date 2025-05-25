import React from "react";

function Button({ text, color = "green", onClick, type = "button" }) {
  return (
    <button
      className={`${color === "green" && "bg-emerald-700"} ${
        color === "red" && "bg-red-900"
      } cursor-pointer ml-auto my-auto px-4 py-2 rounded-2xl font-semibold`}
      onClick={onClick}
      type={type}
    >
      {text}
    </button>
  );
}

export default Button;
