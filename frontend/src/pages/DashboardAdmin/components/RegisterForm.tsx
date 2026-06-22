import React, { useState } from "react";
import { useAddEntry } from "../../../hooks/useQueue";
import type { AddEntryRequest } from "../../../api/types/queue";
import { toast } from "react-hot-toast";
import { User, PlusCircle } from "lucide-react";

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
      onSuccess: () => {
        setFormData(INITIAL_STATE);
        toast.success(`Paciente ${nomeLimpo} adicionado com sucesso!`);
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
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

        {/* Selects: empilhados no mobile, lado a lado no sm+ */}
        {/* MUDANÇA: era "flex gap-4", agora "flex flex-col sm:flex-row gap-4" */}
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