import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export function FormField({ label, value, onChange, placeholder, type = "text" }: FormFieldProps) {
  return (
    <div>
      <div className="font-label text-[10px] font-semibold tracking-[0.12em] uppercase text-soma-gray mb-1.5">
        {label}
      </div>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white border-soma-black/15 text-soma-black placeholder:text-soma-gray/70 font-body"
      />
    </div>
  );
}
