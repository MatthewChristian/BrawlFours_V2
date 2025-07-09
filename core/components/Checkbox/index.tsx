import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

interface Props {
  defaultChecked?: boolean;
  label?: string;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function Checkbox({ defaultChecked, label, onChange, disabled }: Props) {

  const [checkedState, setCheckedState] = useState<boolean>(false);

  function handleChange(check: boolean) {
    if (onChange && !disabled) {
      setCheckedState(check);
      onChange(check);
    }
  }

  useEffect(() => {
    setCheckedState(defaultChecked);
  }, [defaultChecked]);

  return (
    <button className={`flex flex-row gap-1 items-center ${disabled ? 'text-gray-400' : 'hover:text-blue-500'}`}>

      <div className={`flex border ${disabled ? 'border-gray-400' : 'border-blue-500'} rounded items-center justify-center transition-colors h-5 w-5 ${checkedState ? (disabled  ? 'bg-gray-400' : 'bg-blue-500') : 'bg-white'}`} onClick={() => handleChange(!checkedState)}>
        <FaCheck size={12} color='white' />
      </div>

      <div className={'relative top-[1px] text-sm '} onClick={() => handleChange(!checkedState)}>
        {label}
      </div>
    </button>
  );
}
