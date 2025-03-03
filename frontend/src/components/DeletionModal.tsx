import React from "react";
import { useEffect } from "react";
import { Undo2 } from "lucide-react";

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

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
     <div className="bg-[#ffffff] w-3/10 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col space-y-4 p-5">
        <div className="flex flex-row justify-between items-center">
            <h3 className="text-xl font-bold">Confirm Deletion</h3>
              <button onClick={onClose} className="r-btn text-blue-400 hover:text-blue-500 flex items-center">
                Back <Undo2 className="ml-1" size={18}/>
              </button>
          </div>
        <p>
          Are you sure you want to delete <span className="text-blue-400">{name}</span>?
        </p>
        <div className="m-5 flex gap-3 pt-3 justify-center">
            <button
            onClick={onConfirm}
            className="r-btn primary danger w-full"
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
      </div>
    </section>
  );
};

export default DeletionModal;
