import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}

const DeletionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
}) => {
  if (!isOpen) return null;

  return (
    <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
      <div className="bg-[#ffffff] w-1/4 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="flex justify-center">
          <h2 className="m-0">Confirm Deletion</h2>
        </div>
        <p>
          Are you sure you want to delete <span className="text-blue-400">{name}</span>?
        </p>
        <div className="m-5 flex flex-col gap-3 w-1/2">
          <button
            onClick={onConfirm}
            className="r-btn primary danger"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="r-btn w-full bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
};

export default DeletionModal;
