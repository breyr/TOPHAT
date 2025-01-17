import { CircleX } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { authenticatedApiClient, user } = useAuth();
  // Changing password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  //esc button functionality
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setServerMessage("");
    onClose();
  }

  const validPassword = newPassword === confirmPassword && (newPassword !== "" || confirmPassword !== "");
  // Handle form submission for password change
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    //should never be called
    if (newPassword !== confirmPassword) {
      setServerMessage("Passwords must match");
    }     

    try {
      const response = await authenticatedApiClient.updatePassword({
      userId: user?.id,
      oldPassword,
      newPassword});

      if (response.data?.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setServerMessage(response.message);
      }
      else{
        setServerMessage("An error occurred");
      }
    } catch (error) {
      console.error(error);
      setServerMessage("Invalid old password");
    }
  };

  if (!isOpen) return null;  // State storing

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="modal-content relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 bg-white rounded-full hover:bg-gray-200"
          style={{ zIndex: 10 }}
        >
          <CircleX size={20} />
        </button>
        <h2 className="title-container">Settings</h2>

        <div className="flex flex-col space-y-4">
          <form
            onSubmit={handleSubmitPassword}
            className="flex flex-col space-y-4"
          >
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="flex flex-col">
              <label className="font-bold mb-1 block">Old Password</label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)} 
                className="r-input large w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold mb-1 block">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="r-input large w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold mb-1 block">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`r-input large w-full ${
                  newPassword !== confirmPassword && confirmPassword !== ""
                    ? "error"
                    : ""
                }`}
              />
              {newPassword !== confirmPassword && confirmPassword !== "" && (
                <p className="text-red-400 italic">Passwords must match</p>
              )}
            </div>

            <button disabled={!validPassword} type="submit" className="r-btn primary mb-3">
              Change Password
            </button>
            <span>{serverMessage}</span>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;