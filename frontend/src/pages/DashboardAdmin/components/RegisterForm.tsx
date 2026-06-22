import React, { useState } from "react";
import { useAddEntry } from "../../../hooks/useQueue";
import type { AddEntryRequest } from "../../../api/types/queue";
import { toast } from "react-hot-toast";
import { User, PlusCircle, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // Nossa nova biblioteca

const ESPECIALIDADES = [
  { id: "clinico-geral", label: "Clínico Geral" },
  { id: "ortopedia", label: "Ortopedia" },
  { id: "cardiologia", label: "Cardiologia" },
  { id: "pediatria", label: "Pediatria" },
] as const;

const INITIAL_STATE: AddEntryRequest = {
  person_name: "",
  unit_id: "default",
  priority: false,
  category: "clinico-geral",
};

export function RegisterForm() {
  const { mutate, isPending } = useAddEntry();
  const [formData, setFormData] = useState<AddEntryRequest>(INITIAL_STATE);
  const [error, setError] = useState(false);
  
  // Nossos novos estados para o QR Code
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingLink, setTrackingLink] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof AddEntryRequest;
    const value = e.target.value;

    if (name === "person_name" && error) setError(false);

    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? value === "true" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nomeLimpo = formData.person_name.trim();
    if (nomeLimpo.length < 3) {
      setError(true);
      return toast.error("O nome deve ter pelo menos 3 caracteres.");
    }

    mutate({ ...formData, person_name: nomeLimpo }, {
      // Atualizamos o onSuccess para mostrar o QR Code
      onSuccess: () => {
        // NOTA: No futuro, você pode pegar o ID real que o backend devolver aqui.
        // Por enquanto, geramos um token genérico para a tela funcionar perfeitamente.
        const tokenDoPaciente = `pct-${Date.now()}`; 
        const link = `${window.location.origin}/acompanhamento/${tokenDoPaciente}`;
        
        setTrackingLink(link);
        setIsSuccess(true);
        toast.success(`Paciente ${nomeLimpo} adicionado com sucesso!`);
      },
    });
  };

  // Se o cadastro deu certo, renderiza a tela do QR Code em vez do formulário
  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-200 flex flex-col items-center text-center gap-4 transition-all">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cadastro Concluído!</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            O paciente já está na fila. Escaneie o QR Code ou acesse o link para acompanhar.
          </p>
        </div>

        <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mt-2">
          <QRCodeSVG value={trackingLink} size={180} />
        </div>

        <a 
          href={trackingLink} 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-600 font-semibold hover:underline mt-2 text-sm sm:text-base break-all px-4"
        >
          {trackingLink}
        </a>

        <button 
          onClick={() => {
            setIsSuccess(false);
            setFormData(INITIAL_STATE);
          }}
          className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          Cadastrar Novo Paciente
        </button>
      </div>
    );
  }

  // Se não for sucesso (estado normal), renderiza o formulário padrão
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

        {/* Campo Nome */}
        <div className="flex flex-col gap-2">
          <label htmlFor="person_name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Nome do Paciente
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="person_name"
              name="person_name"
              value={formData.person_name}
              onChange={handleInputChange}
              placeholder="Digite o nome completo"
              disabled={isPending}
              className={`w-full bg-slate-50 border rounded-lg pl-10 pr-4 py-3 text-slate-800 focus:ring-2 outline-none transition-all ${
                error
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:ring-blue-600"
              }`}
            />
          </div>
          {error && <span className="text-red-500 text-xs italic">Nome inválido ou muito curto.</span>}
        </div>

        {/* Selects com layout responsivo ajustado */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="priority" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nível de Urgência
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority.toString()}
              onChange={handleInputChange}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
            >
              <option value="false">Normal</option>
              <option value="true">Urgente / Prioritário</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Categoria / Especialidade
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
            >
              {ESPECIALIDADES.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full bg-blue-900 hover:bg-blue-950 disabled:bg-blue-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md active:scale-[0.98]"
        >
          {isPending ? (
            "Processando..."
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              Adicionar à Fila
            </>
          )}
        </button>
      </form>
    </div>
  );
}