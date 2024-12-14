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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="modal-content">
        <h2 className="title-container">Confirm Deletion</h2>
        <p className="description-container">
          Are you sure you want to delete {name}?
        </p>
        <div className="button-container">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 r-btn bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="mr-2 px-4 py-2 r-btn primary danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletionModal;
