import { Component, type ErrorInfo, type ReactNode } from "react";

import ScreenMessage from "./ScreenMessage";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Ловит ошибки рендера, чтобы приложение не превращалось в белый экран.
 * Раньше ErrorBoundary не было вообще: любое исключение в компоненте
 * размонтировало всё дерево без единого сообщения пользователю.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Ошибка рендера", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ScreenMessage
          icon="😕"
          title="Что-то пошло не так"
          description="Приложение столкнулось с ошибкой. Попробуйте перезагрузить."
          actionLabel="Перезагрузить"
          onAction={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
