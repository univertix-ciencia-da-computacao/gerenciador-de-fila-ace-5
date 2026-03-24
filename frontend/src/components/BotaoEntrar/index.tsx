import type { ButtonHTMLAttributes } from 'react';

type BotaoEntrarProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function BotaoEntrar(props: BotaoEntrarProps) {
  return (
    <button
      {...props}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors duration-200 ${props.className || ''}`}
    >
      Entrar
    </button>
  );
}
