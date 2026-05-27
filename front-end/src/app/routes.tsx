import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ChatDashboard } from "./pages/ChatDashboard";
import { FriendsPage } from "./pages/FriendsPage";
import { GroupsPage } from "./pages/GroupsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/chat",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <ChatDashboard />,
      },
      {
        path: "friends",
        element: <FriendsPage />,
      },
      {
        path: "groups",
        element: <GroupsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <ChatDashboard />,
      },
      {
        path: "friends",
        element: <FriendsPage />,
      },
      {
        path: "groups",
        element: <GroupsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
]);
