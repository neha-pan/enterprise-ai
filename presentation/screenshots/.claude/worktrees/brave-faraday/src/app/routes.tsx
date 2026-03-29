import { createBrowserRouter } from "react-router";
import { LoginEntry } from "./components/LoginEntry";
import { Login } from "./components/Login";
import { Home } from "./components/Home";
import { BiometricSetup } from "./components/BiometricSetup";
import { SalesHelpline } from "./components/SalesHelpline";
import { DealerOnboarding } from "./components/DealerOnboarding";
import { ITServiceDesk } from "./components/ITServiceDesk";
import { PortfolioMonitoring } from "./components/PortfolioMonitoring";
import { LeaveTracking } from "./components/LeaveTracking";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginEntry,
  },
  {
    path: "/biometric-setup",
    Component: BiometricSetup,
  },
  {
    path: "/quicksignin",
    Component: Login,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/saleshelpline",
    Component: SalesHelpline,
  },
  {
    path: "/dealeronboarding",
    Component: DealerOnboarding,
  },
  {
    path: "/itservicedesk",
    Component: ITServiceDesk,
  },
  {
    path: "/portfoliomonitoring",
    Component: PortfolioMonitoring,
  },
  {
    path: "/leavetracking",
    Component: LeaveTracking,
  },
]);