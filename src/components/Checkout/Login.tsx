import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Link from "next/link";

const Login = () => {
  const [dropdown, setDropdown] = useState(false);
  const { user, signOut } = useAuth();

  if (user) {
    // Show user info when authenticated
    return (
      <div className="bg-white shadow-1 rounded-[10px] mb-7.5">
        <div className="py-5 px-5.5 border-b border-gray-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM10 6C8.34315 6 7 7.34315 7 9C7 10.6569 8.34315 12 10 12C11.6569 12 13 10.6569 13 9C13 7.34315 11.6569 6 10 6ZM7 14C5.34315 14 4 15.3431 4 17C4 17.5523 4.44772 18 5 18H15C15.5523 18 16 17.5523 16 17C16 15.3431 14.6569 14 13 14H7Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-dark">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="py-4 px-5.5">
          <p className="text-sm text-green-600 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You are signed in and ready to checkout
          </p>
        </div>
      </div>
    );
  }

  // Show login form when not authenticated
  return (
    <div className="bg-white shadow-1 rounded-[10px] mb-7.5">
      <div
        onClick={() => setDropdown(!dropdown)}
        className={`cursor-pointer flex items-center gap-0.5 py-5 px-5.5 ${
          dropdown && "border-b border-gray-3"
        }`}
      >
        Returning customer?
        <span className="flex items-center gap-2.5 pl-1 font-medium text-dark">
          Click here to login
          <svg
            className={`${
              dropdown && "rotate-180"
            } fill-current ease-out duration-200`}
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
              fill=""
            />
          </svg>
        </span>
      </div>

      {/* <!-- dropdown menu --> */}
      <div
        className={`${
          dropdown ? "block" : "hidden"
        } pt-7.5 pb-8.5 px-4 sm:px-8.5`}
      >
        <p className="text-custom-sm mb-6">
          If you haven&apos;t logged in, please log in first or{" "}
          <Link href="/signin" className="text-blue hover:underline">
            go to sign in page
          </Link>
        </p>

        <div className="mb-5">
          <label htmlFor="name" className="block mb-2.5">
            Username or Email
          </label>

          <input
            type="text"
            name="name"
            id="name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2.5">
            Password
          </label>

          <input
            type="password"
            name="password"
            id="password"
            autoComplete="on"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex font-medium text-white bg-blue py-3 px-10.5 rounded-md ease-out duration-200 hover:bg-blue-dark"
          >
            Login
          </button>
          <Link
            href="/signin"
            className="inline-flex font-medium text-blue border border-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue hover:text-white"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
