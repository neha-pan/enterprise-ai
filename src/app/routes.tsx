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
import { EmployeeHome } from "./components/EmployeeHome";
import { B2BHome } from "./components/B2BHome";
import { HRHome } from "./components/HRHome";
import { CorporateHome } from "./components/CorporateHome";

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
    path: "/employee-home",
    Component: EmployeeHome,
  },
  {
    path: "/b2b-home",
    Component: B2BHome,
  },
  {
    path: "/hr-home",
    Component: HRHome,
  },
  {
    path: "/corporate-home",
    Component: CorporateHome,
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
