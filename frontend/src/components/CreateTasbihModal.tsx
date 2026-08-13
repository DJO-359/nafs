import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import { useCreateTasbih } from "../hooks/useTasbih";
import type { CreateTasbihCounterPayload } from "../api/tasbih.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

type TargetMode = "33" | "99" | "100" | "infinite" | "custom";

export default function CreateTasbihModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [targetMode, setTargetMode] = useState<TargetMode>("33");
  const [customTarget, setCustomTarget] = useState("");

  const createMutation = useCreateTasbih();

  const handleCreate = async () => {
    if (!name.trim()) return;

    const payload: CreateTasbihCounterPayload = {
      name: name.trim(),
      count: 0,
    };

    if (targetMode === "infinite") {
      payload.isInfinite = true;
      // target not set for infinite counters
    } else if (targetMode === "custom") {
      const customNum = parseInt(customTarget, 10);
      if (Number.isNaN(customNum) || customNum < 1) return;
      payload.isInfinite = false;
      payload.target = customNum;
    } else {
      payload.isInfinite = false;
      payload.target = parseInt(targetMode, 10);
    }

    await createMutation.mutateAsync(payload);

    // Reset form
    setName("");
    setTargetMode("33");
    setCustomTarget("");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Новый счётчик"
      onClose={onClose}
      footer={
        <Button
          onClick={handleCreate}
          disabled={
            !name.trim() || (targetMode === "custom" && !customTarget.trim())
          }
          loading={createMutation.isPending}
        >
          Создать
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--app-text)]">
            Название
          </label>
          <Input
            placeholder="Например: Субханаллах"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Target Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--app-text)]">
            Цель
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { mode: "33" as const, label: "33" },
                { mode: "99" as const, label: "99" },
                { mode: "100" as const, label: "100" },
                { mode: "infinite" as const, label: "∞" },
              ] as const
            ).map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setTargetMode(mode);
                  setCustomTarget("");
                }}
                className={`rounded-lg border-2 py-2 font-medium transition ${
                  targetMode === mode
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:border-emerald-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Target */}
          <button
            type="button"
            onClick={() => setTargetMode("custom")}
            className={`mt-2 w-full rounded-lg border-2 py-2 font-medium transition ${
              targetMode === "custom"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-300"
                : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:border-emerald-300"
            }`}
          >
            Своё значение
          </button>

          {targetMode === "custom" && (
            <Input
              type="number"
              placeholder="Введите число (1 и более)"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              min="1"
              className="mt-2"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
