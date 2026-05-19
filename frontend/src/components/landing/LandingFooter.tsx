import { Link, useNavigate } from "react-router";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useUser } from "../../context/UserContext";
import { userMayUseLearnerApp } from "../../lib/subscriptionAccess";
import { Send } from "lucide-react";

export function LandingFooter() {
  const { messages } = useLandingLocale();
  const { footer } = messages;
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const showPaywallLogout = Boolean(user && !userMayUseLearnerApp(user));

  const footerSections: {
    title: string;
    links: { label: string; to: string }[];
  }[] = [
    {
      title: footer.categories.product,
      links: [
        {
          label: footer.links.launchCountdown,
          to: "/#release-countdown",
        },
        { label: footer.links.whyChoose, to: "/#why-choose-explys" },
        { label: footer.links.howWorks, to: "/#how-explys-works" },
        { label: footer.links.pricing, to: "/pricing" },
        { label: footer.links.readyToStart, to: "/#ready-to-start" },
      ],
    },
    {
      title: footer.categories.account,
      links: [
        { label: footer.links.logIn, to: "/loginForm" },
        { label: footer.links.register, to: "/registrationMain" },
      ],
    },
  ];

  return (
    <footer className="border-border border-t font-display bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <img src="/Icon.svg" className="w-12 h-14 pr-1" alt="" />
              <span className="font-display text-xl font-bold text-foreground">
                Explys
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {footer.tagline}
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.title === footer.categories.account &&
                showPaywallLogout ? (
                  <li key="logout">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      onClick={() => {
                        logout();
                        void navigate("/");
                      }}
                    >
                      {footer.links.logout}
                    </button>
                  </li>
                ) : (
                  section.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-border border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Explys. {footer.copyright}
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://t.me/ExplysEng"
              className="text-muted-foreground transition-colors hover:text-primary"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
