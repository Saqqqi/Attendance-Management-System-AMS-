// components/Header.js

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMdArrowBack } from "react-icons/io";

const Header = ({ employee, goBackLink, onProfileMenuToggle, heading, paragraph }) => {
  // Toggle menu visibility
  const toggleMenu = () => {
    const menuItems = document.getElementById("menuItems");
    const isVisible = menuItems.style.display === "block";
    menuItems.style.display = isVisible ? "none" : "block";
    menuItems.style.opacity = isVisible ? "0" : "1";
    menuItems.style.transform = isVisible ? "scale(0.95)" : "scale(1)";
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const menuButton = document.getElementById("menuButton");
      const menuItems = document.getElementById("menuItems");
      if (menuButton && menuItems && !menuButton.contains(event.target) && !menuItems.contains(event.target)) {
        menuItems.style.display = "none";
        menuItems.style.opacity = "0";
        menuItems.style.transform = "scale(0.95)";
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="space-y-4 flex items-center justify-between">
      {/* Right Section: Go Back Button and Profile Dropdown */}
      <div className="flex justify-between w-full items-center">
        {/* Go Back Button */}
        <Link to={goBackLink}>
          <button className="text-red-700 text-md flex items-center justify-between gap-2 border border-red-700 py-1 px-6 rounded-full">
            <IoMdArrowBack className="mt-1" /> <span>Go Back</span>
          </button>
        </Link>

        {/* Profile Dropdown Menu */}
        {employee && (
          <div className="relative p-4 rounded-lg shadow-sm bg-transparent">
            <button
              id="menuButton"
              className="w-full border border-green-500 rounded-full py-2 px-4 text-sm flex justify-between items-center"
              onClick={toggleMenu}
            >
              <span className='text-green-500 mr-2'>{employee.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu Items */}
            <div
              id="menuItems"
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-transparent border border-green-500 shadow-lg scale-95 opacity-0 transition-all duration-200 ease-out"
              style={{ display: 'none' }}
            >
              <div className="py-1">
                <Link
                  to={{
                    pathname: `/attendance/employee/${employee._id}`,
                    state: { employee }
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-700 hover:text-green-500"
                >
                  View Monthly Attendance
                </Link>

                <Link to={"/logout"}>
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-700 hover:text-green-500"
                  >
                    Sign out
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Heading and Paragraph Text */}
      <div className="text-center mt-6">
        <h1 className="text-2xl font-bold text-white">{heading}</h1>
        <p className="text-sm text-gray-400 mt-2">{paragraph}</p>
      </div>
    </div>
  );
};

export default Header;
