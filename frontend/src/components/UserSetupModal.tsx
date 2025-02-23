import React, { useState } from "react";
import { Eye, EyeOff, User as USER } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface ModalProps {
  onSubmit: () => void;
}

const UserSetupModal: React.FC<ModalProps> = ({ onSubmit }) => {
  const { authenticatedApiClient, user, updateUser } = useAuth();
  const [showPassword, setShowPassword] = useState({ viewPassword: false, viewConfirmPassword: false });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const validPassword = newPassword === confirmPassword && (newPassword !== "" || confirmPassword !== "");
  

  const handleVisibilityChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;
    setShowPassword(prevState => ({
        ...prevState,
        [name]: !showPassword[name]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //should never be called
    if (!validPassword) {
      return;
    }
    try {
      if (user?.id !== undefined) {
        const passwordResponse = await authenticatedApiClient.updatePassword({ userId: user?.id, newPassword});
        const userResponse = await authenticatedApiClient.updateUser(user.id, { username: username, email: user.email, accountStatus: 'ACCEPTED' });
        if (passwordResponse.data?.success && userResponse.data?.success) {
          onSubmit();
          updateUser({ ...user, username, accountStatus: 'ACCEPTED' });
        } 
        else {
          setServerMessage("Username already exists. Try another one.");
        }
      }
      else {
        setServerMessage("User ID is undefined.");
      }

    } catch(error) {
      setServerMessage("Username already exists. Try another one."); //this is the only error message we can get from the backend
      console.log(error);
    }
  }

  return (
    <div className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
      <div className="modal-content relative">
          <h2 className="title-container">Setup Account</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center mb-6">
              <USER className="text-blue-500 w-24 h-24" />
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="flex flex-col">
              <label className="font-bold block" htmlFor="username">Set Username</label>
              <input 
                className="r-input large w-full" 
                name="username" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="flex flex-col relative">
                <label className="font-bold block" htmlFor="username">New Password</label>
                <input
                  id="newPassword"
                  type={showPassword.viewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="r-input large w-full pr-10"
                />
                <button
                  name="viewPassword"
                  type="button"
                  className="absolute right-2 mt-7 pt-0.5 text-grey-500"
                  onClick={handleVisibilityChange}
                  tabIndex={-1} 
                >
                  {showPassword.viewPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              <div className="flex flex-col relative">
                <label className="font-bold block" htmlFor="username">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type={showPassword.viewConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`r-input large w-full ${
                    newPassword !== confirmPassword && confirmPassword !== ""
                      ? "error"
                      : ""
                  }`}
                />
                <button
                  name="viewConfirmPassword"
                  type="button"
                  className="absolute right-2 mt-7 pt-0.5 text-grey-500"
                  onClick={handleVisibilityChange}
                  tabIndex={-1}
                >
                  {showPassword.viewConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
                {newPassword !== confirmPassword && confirmPassword !== "" && (
                  <p className="text-red-400 italic">Passwords must match</p>
                )}
              </div>
              <button disabled={!validPassword} type="submit" className="r-btn primary mb-3">
                Submit
              </button>
              <span>{serverMessage}</span>
            </form>
          </div>
      </div>
    </div>
  );
}
export default UserSetupModal;