import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "@clerk/react";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  // avoid using the entire store to prevent unnecessary re-renders when the state changes
  // const { checkAuth, isCheckingAuth, clearAuth } = useAuthStore();

  // better performance to avoid re-rendering the component when the state changes
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) checkAuth();
    else clearAuth();
  }, [checkAuth, clearAuth, isLoaded, isSignedIn]);

  return (
    <ThemeProvider>
      {!isLoaded || (isCheckingAuth && !isSignedIn) ? (
        <PageLoader />
      ) : (
        <WallpaperProvider>
          <Routes>
            <Route
              path="/"
              element={
                isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />
              }
            />
            <Route
              path="/auth"
              element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />}
            />
          </Routes>
          <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "14px",
                maxWidth: "400px",
                padding: "12px 16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              },
              success: {
                iconTheme: {
                  primary: "var(--accent)",
                  secondary: "var(--accent-foreground)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--danger)",
                  secondary: "var(--accent-foreground)",
                },
              },
            }}
          />
        </WallpaperProvider>
      )}
    </ThemeProvider>
  );
};

export default App;
