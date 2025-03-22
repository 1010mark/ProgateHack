import { Input } from '@/components/ui/input';

type inputType = 'text' | 'number' | 'date';

interface DateInputBoxProps {
  label: string;
  placeholder: string;
  type: string;
  value: Date;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DateInputBox = ({
  label,
  placeholder,
  type,
  value,
  onChange,
}: DateInputBoxProps) => {
  return (
    <div className='flex flex-col gap-1 '>
      <label className=' font-bold text-xl'>{label}</label>
      <Input
        type='date'
        placeholder={placeholder}
        value={value.toString().split('T')[0]}
        onChange={onChange}
        className=' hover:border-blue-300'
      />
    </div>
  );
};
