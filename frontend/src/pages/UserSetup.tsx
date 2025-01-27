import React, { useState } from "react";
import { Eye, EyeOff, User as USER } from "lucide-react";
import OnboardTopNav from "../components/OnboardTopNav";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User } from "../models/User";

export default function UserSetupPage() {
  const { authenticatedApiClient, user, login } = useAuth();
  const [currentUser, setUser] = useState<User>();
  const navigateTo = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //should never be called
    if (!validPassword) {
      return;
    }

    try {
      const userId = user?.id;


      // const response = await authenticatedApiClient.updatePassword({
      //   userId: userId,
      //   oldPassword: "",
      //   newPassword});
      // const data = { username, password: newPassword, accountStatus: AccountStatus };
      if (userId !== undefined) {
        const updateUsername = await authenticatedApiClient.updateUser(userId, { username });
        const updatePassword = await authenticatedApiClient.updatePassword({ userId, oldPassword: "", newPassword });
      } else {
        setServerMessage("User ID is undefined.");
      }

      // if (response.success) {
      //   const { success, message } = await login(username, newPassword);
      //   if (success) {
      //     navigateTo('/dashboard/');
      //   } else {
      //     setServerMessage(message ?? "A server error occurred");
      //   }
      // } else {
      //   setServerMessage(response.message ?? "An error occurred during account setup.");
      // }

    } catch(error) {
      console.error('Error during account setup:', error);
      setServerMessage("An error occurred during account setup.");
    }
  }

  return (
    <section className="flex flex-col h-lvh p-[1.875rem]">
      <OnboardTopNav />
      <div className="flex flex-1 justify-center items-center">
        <section className="flex flex-col h-full w-full p-8 items-center">
          <h1 className="text-4xl font-bold mb-4">Setup Account</h1>
          <p className="text-lg mb-5">Let's set your username and password.</p>
          <section className="flex-1 w-full flex justify-center items-center">
            <div className="flex-1 w-full flex justify-center items-center">
              <div className="p-10 bg-white shadow-lg rounded-lg min-w-1/4 w-1/3">
                <div>
                  <div className="flex justify-center mb-6">
                    <USER className="text-blue-500 w-24 h-24" />
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="flex flex-col">
                    <label className="font-bold block" htmlFor="username">Username</label>
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
          </section>
        </section>
      </div>
    </section>
  );
}