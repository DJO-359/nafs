export const TASBIH_COLORS = [
  {
    key: "emerald",
    label: "Зелёный",
    main: "#34f5a2",
    gradient: "linear-gradient(145deg, #d7ffe9 0%, #34f5a2 28%, #00a878 100%)",
    shadow: "0 0 18px rgba(52, 245, 162, 0.6)",
  },
  {
    key: "cyan",
    label: "Голубой",
    main: "#38e8ff",
    gradient: "linear-gradient(145deg, #e0fcff 0%, #38e8ff 30%, #087eae 100%)",
    shadow: "0 0 18px rgba(56, 232, 255, 0.62)",
  },
  {
    key: "pink",
    label: "Розовый",
    main: "#ff5ec4",
    gradient: "linear-gradient(145deg, #ffe1f5 0%, #ff5ec4 30%, #ba167d 100%)",
    shadow: "0 0 18px rgba(255, 94, 196, 0.6)",
  },
  {
    key: "red",
    label: "Красный",
    main: "#ff5b63",
    gradient: "linear-gradient(145deg, #ffe2e4 0%, #ff5b63 30%, #b5122e 100%)",
    shadow: "0 0 18px rgba(255, 91, 99, 0.58)",
  },
  {
    key: "violet",
    label: "Фиолетовый",
    main: "#b77cff",
    gradient: "linear-gradient(145deg, #f1e5ff 0%, #b77cff 30%, #6226be 100%)",
    shadow: "0 0 18px rgba(183, 124, 255, 0.62)",
  },
  {
    key: "silver",
    label: "Серый",
    main: "#d8e2ee",
    gradient: "linear-gradient(145deg, #ffffff 0%, #d8e2ee 38%, #718096 100%)",
    shadow: "0 0 18px rgba(216, 226, 238, 0.48)",
  },
] as const;

export type TasbihColorKey = (typeof TASBIH_COLORS)[number]["key"];

export function getTasbihColor(key: string | null | undefined) {
  return TASBIH_COLORS.find((color) => color.key === key) ?? TASBIH_COLORS[0];
}
