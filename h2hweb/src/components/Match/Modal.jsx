import React from "react";

function Modal({ showModal, setShowModal }) {
  return (
    <div className="w-full h-full bg-black opacity-50 fixed top-0 left-0 z-1 backdrop-blur-xl">
      <div
        className={`left-1/3 top-1/4 fixed z-50 w-1/3 h-1/2 bg-zinc-600 ${
          showModal ? "block" : "hidden"
        }`}
      ></div>
    </div>
  );
}

export default Modal;
