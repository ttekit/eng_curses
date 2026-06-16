import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { LandingLocaleProvider } from "./context/LandingLocaleContext";
import RegistrationMain from "./pages/registration/RegistrationMain";
import RegistrationDetails from "./pages/registration/RegistrationDetails";
import RegistrationPreferences from "./pages/registration/RegistrationPreferences";
import LoginForm from "./pages/login/LoginForm";
import { RegistrationProvider } from "./context/RegistrationContext";
import ContentPage from "./pages/content/ContentPage";
import ProfileMain from "./pages/profile/ProfileMain";
import { UserProvider } from "./context/UserContext";
import VideoPage from "./pages/content/VideosPage";
import CatalogSeriesPage from "./pages/content/CatalogSeriesPage";
import WatchedLessonsPage from "./pages/content/WatchedLessonsPage";
import LearnerRecapQuizPage from "./pages/content/LearnerRecapQuizPage";
import LessonSummaryPage from "./pages/content/LessonSummaryPage";
import RegisterSuccessPage from "./pages/registration/RegisterSuccessPage";
import LandingPage from "./pages/landing/LandingPage";
import LevelTestPage from "./pages/registration/LevelTestPage";
import LearningPlanPage from "./pages/learning/LearningPlanPage";
import PricingPage from "./pages/pricing/PricingPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminVideosPage from "./pages/admin/AdminVideosPage";
import AdminTeachersPage from "./pages/admin/AdminTeachersPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AnalyticsLayout from "./components/AnalyticsLayout";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import RequireSubscriberAccess from "./components/RequireSubscriberAccess";
import SubscribePage from "./pages/subscription/SubscribePage";
import { EmailVerification } from "./pages/registration/EmailVerification";
import RestoreAccount from "./pages/login/RestoreAccount";
import AdminAvatarsPage from "./pages/admin/AdminAvatarsPage";
import ClassroomPage from "./pages/content/ClassroomPage";
import LeaderboardPage from "./pages/leaderboard/LeaderboardPage";
import CustomisePage from "./pages/customise/CustomisePage";
import AboutPage from "./pages/legal/AboutPage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import FeedbackPage from "./pages/legal/FeedbackPage";
import GoogleDobPrompt from "./components/profile/GoogleDobPrompt";
import OAuthSuccess from "./pages/login/OAuthSuccess";
import { Error404Page } from "./pages/Error404Page";
import { ThemeProvider } from "./context/ThemeContext";

const router = createBrowserRouter([
  {
    element: <AnalyticsLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/registrationMain", element: <RegistrationMain /> },
      { path: "/registrationDetails", element: <RegistrationDetails /> },
      {
        path: "/registrationPreferences",
        element: <RegistrationPreferences />,
      },
      { path: "/registrationSuccess", element: <RegisterSuccessPage /> },
      { path: "/verify-email", element: <EmailVerification /> },
      { path: "/restore-account", element: <RestoreAccount /> },
      { path: "/loginForm", element: <LoginForm /> },
      { path: "/oauth/success", element: <OAuthSuccess /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/privacy", element: <PrivacyPolicyPage /> },
      { path: "/terms", element: <TermsOfServicePage /> },
      { path: "/feedback", element: <FeedbackPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "/onboarding/dob", element: <GoogleDobPrompt /> },
          { path: "/subscribe", element: <SubscribePage /> },
          {
            path: "/admin",
            element: <RequireAdmin />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminDashboardPage /> },
                  { path: "users", element: <AdminUsersPage /> },
                  { path: "videos", element: <AdminVideosPage /> },
                  { path: "teachers", element: <AdminTeachersPage /> },
                  { path: "analytics", element: <AdminAnalyticsPage /> },
                  { path: "avatars", element: <AdminAvatarsPage /> },
                  { path: "settings", element: <AdminSettingsPage /> },
                ],
              },
            ],
          },
          { path: "/level-test", element: <LevelTestPage /> },
          {
            element: <RequireSubscriberAccess />,
            children: [
              {
                path: "/entrance-test",
                element: <Navigate to="/catalog" replace />,
              },
              {
                path: "/contentPage",
                element: <Navigate to="/watched-lessons" replace />,
              },
              { path: "/watched-lessons", element: <WatchedLessonsPage /> },
              {
                path: "/watched-lessons/recap/:kind",
                element: <LearnerRecapQuizPage />,
              },
              { path: "/profileMain", element: <ProfileMain /> },
              { path: "/profile", element: <ProfileMain /> },
              {
                path: "/catalog/series/:friendlyLink",
                element: <CatalogSeriesPage />,
              },
              { path: "/catalog", element: <VideoPage /> },
              { path: "/customise", element: <CustomisePage /> },
              { path: "/classroom", element: <ClassroomPage /> },
              { path: "/leaderboard", element: <LeaderboardPage /> },
              { path: "/learning-plan", element: <LearningPlanPage /> },
              {
                path: "/video-page",
                element: <Navigate to="/catalog" replace />,
              },
              { path: "/content/:id/summary", element: <LessonSummaryPage /> },
              { path: "/content/:id?", element: <ContentPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <Error404Page /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="explys-ui-theme">
        {" "}
        <LandingLocaleProvider>
          <UserProvider>
            <RegistrationProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-center"
                toastOptions={{
                  className: "bg-zinc-900 text-zinc-100 border border-zinc-700",
                  style: { boxShadow: "0 8px 30px rgba(0,0,0,0.4)" },
                }}
              />
            </RegistrationProvider>
          </UserProvider>
        </LandingLocaleProvider>
      </ThemeProvider>{" "}
    </HelmetProvider>
  </StrictMode>,
);
