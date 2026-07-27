interface Props {
  children: React.ReactNode;
}

export default function InfoText({ children }: Props) {
  return <p className="text-sm leading-6 text-gray-500">{children}</p>;
}
