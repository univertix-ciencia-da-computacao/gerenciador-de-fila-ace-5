import type { ButtonHTMLAttributes } from 'react';

type BotaoVoltarProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function BotaoVoltar(props: BotaoVoltarProps) {
  return (
    <button
      {...props}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors duration-200 ${props.className || ''}`}
    >
      Voltar
    </button>
  );
}