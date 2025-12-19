"use client";

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authprovider";
import registerimage from "../assets/registerimage.jpeg";

export function Registerpage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-6xl p-6 bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IMAGE CARD (unchanged) */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative bg-gray-800/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-gray-700/60">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-70" />
              <img
                src={registerimage.jpeg}
                alt="Register illustration"
                className="relative rounded-xl object-contain max-h-[420px]"
              />
            </div>
          </div>

          {/* REGISTER CARD — SAME SIZE AS LOGIN */}
          <div
            className="bg-gray-900/80 rounded-2xl p-8 sm:p-10 border border-gray-700/50 shadow-lg
                          h-[520px] flex flex-col"
          >
            {/* HEADER (fixed height) */}
            <div className="mb-6 text-center shrink-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Create account
              </h1>
              <p className="text-sm text-gray-400">Sign up to get started</p>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 shrink-0">
                {error}
              </div>
            )}

            {/* SCROLLABLE FORM AREA */}
            <div className="flex-1 overflow-y-auto pr-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full border-2 border-gray-700 rounded-lg px-4 py-3 bg-gray-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full border-2 border-gray-700 rounded-lg px-4 py-3 bg-gray-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full border-2 border-gray-700 rounded-lg px-4 py-3 bg-gray-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full border-2 border-gray-700 rounded-lg px-4 py-3 bg-gray-800 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </form>
            </div>

            {/* FOOTER (fixed) */}
            <p className="mt-4 text-center text-sm text-gray-400 shrink-0">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-indigo-400 font-semibold hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registerpage;
