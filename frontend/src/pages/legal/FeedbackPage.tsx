import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import InputText from "../../components/InputText";
import { StaticMarketingPageLayout } from "../../components/landing/StaticMarketingPageLayout";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function FeedbackPage() {
  const { messages } = useLandingLocale();
  const page = messages.feedbackPage;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast.error(page.messageRequired);
      return;
    }
    setIsSubmitting(true);
    toast.success(page.successToast);
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <StaticMarketingPageLayout
      title={page.seoTitle}
      description={page.seoDescription}
      path="/feedback"
    >
      <div className="space-y-8">
        <header className="space-y-4 border-b border-border/60 pb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            {page.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {page.lead}
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="feedback-name" className="text-sm font-medium">
              {page.nameLabel}
            </label>
            <InputText
              id="feedback-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={page.namePlaceholder}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback-email" className="text-sm font-medium">
              {page.emailLabel}
            </label>
            <InputText
              id="feedback-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={page.emailPlaceholder}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback-message" className="text-sm font-medium">
              {page.messageLabel}
            </label>
            <textarea
              id="feedback-message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={page.messagePlaceholder}
              rows={6}
              required
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-base text-foreground shadow-xs transition-colors placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <p className="text-sm text-muted-foreground">{page.note}</p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-0 w-full sm:w-auto sm:min-w-[180px]"
          >
            {isSubmitting ? page.submitting : page.submit}
          </Button>
        </form>
      </div>
    </StaticMarketingPageLayout>
  );
}
