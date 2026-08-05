import { useMemo, useState } from "react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import OnboardingShell from "../components/OnboardingShell";
import { useOnboardingSettings } from "../hooks/useOnboarding";
import {
  completeOnboarding as completeOnboardingRequest,
  type CompleteOnboardingRequest,
} from "../api/users.api";

const STEPS = ["welcome", "wake", "sleep", "reminder"] as const;

type Step = (typeof STEPS)[number];

interface OnboardingPageProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [settings, setSettings] = useOnboardingSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  const canContinue = useMemo(() => {
    if (step === "wake") {
      return settings.wakeTime !== "";
    }

    if (step === "sleep") {
      return settings.sleepTime !== "";
    }

    if (step === "reminder") {
      return settings.eveningReminderEnabled !== null;
    }

    return true;
  }, [settings, step]);

  async function nextStep() {
    if (stepIndex + 1 < STEPS.length) {
      setStepIndex(stepIndex + 1);
      return;
    }

    setLoading(true);
    setError(null);

    const payload: CompleteOnboardingRequest = {
      wakeTime: settings.wakeTime,
      sleepTime: settings.sleepTime,
      eveningReminderEnabled: settings.eveningReminderEnabled ?? false,
    };

    try {
      await completeOnboardingRequest(payload);
      onComplete();
    } catch (err) {
      setError(
        "Не удалось завершить onboarding. Пожалуйста, попробуйте снова.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold">{getTitle(step)}</h1>
          {step === "sleep" ? (
            <p className="mt-3 text-[var(--app-hint)]">
              За 30 минут до этого времени Nafs будет напоминать подвести итоги
              дня.
            </p>
          ) : step === "reminder" ? (
            <p className="mt-3 text-[var(--app-hint)]">
              🌙 Этот день уже никогда не повторится. Подведите его итоги.
            </p>
          ) : null}
        </header>

        <div className="space-y-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
          {step === "welcome" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--app-hint)]">
                Добро пожаловать в Nafs.
              </p>
              <p className="text-sm text-[var(--app-hint)]">
                Это приложение для одного дня. Каждое утро вы будете начинать с
                намерения, которое сформулировали вчера вечером.
              </p>
            </div>
          )}

          {step === "wake" && (
            <label className="space-y-3">
              <div className="text-sm text-[var(--app-hint)]">
                Во сколько вы обычно просыпаетесь?
              </div>
              <Input
                type="time"
                value={settings.wakeTime}
                onChange={(event) =>
                  setSettings({ ...settings, wakeTime: event.target.value })
                }
              />
            </label>
          )}

          {step === "sleep" && (
            <label className="space-y-3">
              <div className="text-sm text-[var(--app-hint)]">
                Во сколько вы обычно заканчиваете свой день?
              </div>
              <Input
                type="time"
                value={settings.sleepTime}
                onChange={(event) =>
                  setSettings({ ...settings, sleepTime: event.target.value })
                }
              />
            </label>
          )}

          {step === "reminder" && (
            <div className="space-y-4">
              <div className="text-sm text-[var(--app-hint)]">
                Хотите получать вечернее напоминание?
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    settings.eveningReminderEnabled === true
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-[var(--app-border)] bg-white"
                  }`}
                  onClick={() =>
                    setSettings({ ...settings, eveningReminderEnabled: true })
                  }
                >
                  Да
                </button>
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    settings.eveningReminderEnabled === false
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-[var(--app-border)] bg-white"
                  }`}
                  onClick={() =>
                    setSettings({ ...settings, eveningReminderEnabled: false })
                  }
                >
                  Нет
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={nextStep} disabled={!canContinue || loading}>
          {stepIndex + 1 < STEPS.length ? "Далее" : "Завершить"}
        </Button>
      </div>
    </OnboardingShell>
  );
}

function getTitle(step: Step) {
  switch (step) {
    case "welcome":
      return "Добро пожаловать в Nafs";
    case "wake":
      return "Во сколько вы обычно просыпаетесь?";
    case "sleep":
      return "Во сколько вы обычно заканчиваете свой день?";
    case "reminder":
      return "Хотите получать вечернее напоминание?";
  }
}
